#!/usr/bin/env python3
import json
import re
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

import fitz

ROOT = Path.cwd()
OUT = ROOT / "docs" / "premium-map-pdf-evidence"
OUT.mkdir(parents=True, exist_ok=True)

SOURCES = [
    {
        "outletId": "outletcity-metzingen",
        "operator": "OUTLETCITY AG",
        "url": "https://stc.outletcity.com/f/ffc38a574345f2deedf1c5ca33a8fdc5ab8f6590.pdf",
    },
    {
        "outletId": "the-mall-firenze",
        "operator": "The Mall Luxury Outlets",
        "url": "https://firenze.themall.it/pdf/The-Mall-Firenze-Map.pdf",
    },
]

UA = "Mozilla/5.0 (compatible; MyOutletGuide/1.0; +https://my-outlet-guide.web.app)"


def download(url: str, path: Path):
    request = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/pdf,*/*;q=0.8"})
    with urllib.request.urlopen(request, timeout=45) as response:
        data = response.read()
    if not data.startswith(b"%PDF"):
        raise RuntimeError(f"{url} did not return a PDF ({len(data)} bytes)")
    path.write_bytes(data)


def finite_number(value, fallback=None, digits=5):
    if value is None:
        return fallback
    try:
        number = float(value)
    except (TypeError, ValueError):
        return fallback
    if number != number or number in (float("inf"), float("-inf")):
        return fallback
    return round(number, digits)


def rect_list(rect):
    if rect is None:
        return None
    return [finite_number(rect.x0, 0, 4), finite_number(rect.y0, 0, 4), finite_number(rect.x1, 0, 4), finite_number(rect.y1, 0, 4)]


def point_list(point):
    if point is None:
        return None
    return [finite_number(point.x, 0, 4), finite_number(point.y, 0, 4)]


def color_value(value):
    if value is None:
        return None
    if isinstance(value, (list, tuple)):
        return [finite_number(v, None, 5) for v in value]
    return value


def drawing_item(item):
    converted = []
    for value in item[1:]:
        if value is None:
            converted.append(None)
        elif isinstance(value, fitz.Point):
            converted.append(point_list(value))
        elif isinstance(value, fitz.Rect):
            converted.append(rect_list(value))
        elif isinstance(value, fitz.Quad):
            converted.append([point_list(value.ul), point_list(value.ur), point_list(value.lr), point_list(value.ll)])
        elif isinstance(value, (int, float)):
            converted.append(finite_number(value, None, 5))
        else:
            converted.append(str(value))
    return {"op": item[0], "args": converted}


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def extract_page(page):
    words = []
    for word_data in page.get_text("words", sort=False):
        x0, y0, x1, y1, text, block, line, word = word_data[:8]
        text = normalize_text(str(text))
        if not text:
            continue
        words.append({
            "text": text,
            "bbox": [finite_number(x0, 0, 4), finite_number(y0, 0, 4), finite_number(x1, 0, 4), finite_number(y1, 0, 4)],
            "block": int(block),
            "line": int(line),
            "word": int(word),
        })

    spans = []
    raw = page.get_text("dict")
    for block in raw.get("blocks", []):
        for line in block.get("lines", []):
            direction = line.get("dir") or (1, 0)
            for span in line.get("spans", []):
                text = normalize_text(span.get("text", ""))
                if not text:
                    continue
                spans.append({
                    "text": text,
                    "bbox": [finite_number(v, 0, 4) for v in (span.get("bbox") or [])],
                    "origin": [finite_number(v, 0, 4) for v in (span.get("origin") or [])],
                    "font": span.get("font"),
                    "size": finite_number(span.get("size"), 0, 4),
                    "color": span.get("color"),
                    "flags": span.get("flags"),
                    "dir": [finite_number(v, 0, 6) for v in direction],
                })

    drawings = []
    for drawing in page.get_drawings(extended=True):
        drawings.append({
            "type": drawing.get("type"),
            "rect": rect_list(drawing.get("rect")),
            "closePath": bool(drawing.get("closePath", False)),
            "fill": color_value(drawing.get("fill")),
            "color": color_value(drawing.get("color")),
            "width": finite_number(drawing.get("width"), 0, 5),
            "fillOpacity": finite_number(drawing.get("fill_opacity"), 1, 5),
            "strokeOpacity": finite_number(drawing.get("stroke_opacity"), 1, 5),
            "items": [drawing_item(item) for item in drawing.get("items", [])],
        })

    links = []
    for link in page.get_links():
        links.append({
            "from": rect_list(link.get("from")),
            "uri": link.get("uri"),
            "kind": int(link.get("kind", 0)),
        })

    return {
        "pageNumber": page.number + 1,
        "width": finite_number(page.rect.width, 0, 4),
        "height": finite_number(page.rect.height, 0, 4),
        "rotation": page.rotation,
        "words": words,
        "spans": spans,
        "drawings": drawings,
        "links": links,
        "stats": {
            "wordCount": len(words),
            "spanCount": len(spans),
            "drawingCount": len(drawings),
            "closedDrawingCount": sum(1 for drawing in drawings if drawing["closePath"]),
        },
    }


def main():
    summary = []
    for source in SOURCES:
        outlet_id = source["outletId"]
        pdf_path = OUT / f"{outlet_id}.pdf"
        try:
            download(source["url"], pdf_path)
            document = fitz.open(pdf_path)
            pages = [extract_page(page) for page in document]
            evidence = {
                "schemaVersion": 1,
                **source,
                "pdfBytes": pdf_path.stat().st_size,
                "pageCount": len(document),
                "metadata": document.metadata,
                "pages": pages,
            }
            (OUT / f"{outlet_id}.json").write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            summary.append({
                "outletId": outlet_id,
                "status": "ok",
                "pageCount": len(document),
                "pdfBytes": pdf_path.stat().st_size,
                "wordCount": sum(page["stats"]["wordCount"] for page in pages),
                "drawingCount": sum(page["stats"]["drawingCount"] for page in pages),
                "closedDrawingCount": sum(page["stats"]["closedDrawingCount"] for page in pages),
            })
            document.close()
        except Exception as exc:
            summary.append({"outletId": outlet_id, "status": "failed", "error": str(exc)})
        finally:
            pdf_path.unlink(missing_ok=True)

    (OUT / "summary.json").write_text(
        json.dumps({"generatedAt": datetime.now(timezone.utc).isoformat(), "sources": summary}, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(summary, indent=2))
    if any(item["status"] != "ok" for item in summary):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
