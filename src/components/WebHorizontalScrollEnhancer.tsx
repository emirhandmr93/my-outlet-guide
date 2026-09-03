import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { Platform } from "react-native";

const DRAG_THRESHOLD_PX = 6;
const OVERFLOW_TOLERANCE_PX = 8;

function findHorizontalScroller(start: any): any | null {
  if (typeof window === "undefined" || typeof document === "undefined") return null;

  let node = start?.nodeType === 1 ? start : start?.parentElement;
  while (node && node !== document.documentElement) {
    const scrollWidth = Number(node.scrollWidth);
    const clientWidth = Number(node.clientWidth);
    if (
      Number.isFinite(scrollWidth) &&
      Number.isFinite(clientWidth) &&
      scrollWidth > clientWidth + OVERFLOW_TOLERANCE_PX
    ) {
      const overflowX = window.getComputedStyle(node).overflowX;
      if (overflowX === "auto" || overflowX === "scroll") return node;
    }
    node = node.parentElement;
  }
  return null;
}

export function WebHorizontalScrollEnhancer({ children }: PropsWithChildren) {
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    let activeScroller: any | null = null;
    let activePointerId: number | null = null;
    let startClientX = 0;
    let startScrollLeft = 0;
    let dragged = false;
    let suppressNextClick = false;
    let previousCursor = "";
    let previousUserSelect = "";
    let clickResetTimer: ReturnType<typeof setTimeout> | undefined;

    const styleElement = document.createElement("style");
    styleElement.setAttribute("data-mog-web-horizontal-scroll", "true");
    styleElement.textContent = `
      [data-mog-manual-horizontal-scroll="true"] { cursor: grab; overscroll-behavior-inline: contain; }
      [data-mog-manual-horizontal-scroll="true"][data-mog-dragging="true"] { cursor: grabbing !important; }
    `;
    document.head.appendChild(styleElement);

    function markScroller(scroller: any) {
      if (scroller?.dataset) scroller.dataset.mogManualHorizontalScroll = "true";
    }

    function resetActiveScroller() {
      if (activeScroller) {
        if (activeScroller.dataset) delete activeScroller.dataset.mogDragging;
        if (activeScroller.style) {
          activeScroller.style.cursor = previousCursor;
          activeScroller.style.userSelect = previousUserSelect;
        }
        if (
          activePointerId !== null &&
          typeof activeScroller.hasPointerCapture === "function" &&
          typeof activeScroller.releasePointerCapture === "function"
        ) {
          try {
            if (activeScroller.hasPointerCapture(activePointerId)) {
              activeScroller.releasePointerCapture(activePointerId);
            }
          } catch {
            // Pointer capture is best-effort and may already have been released by the browser.
          }
        }
      }

      activeScroller = null;
      activePointerId = null;
      dragged = false;
      previousCursor = "";
      previousUserSelect = "";
    }

    function handlePointerOver(event: any) {
      const scroller = findHorizontalScroller(event.target);
      if (scroller) markScroller(scroller);
    }

    function handlePointerDown(event: any) {
      if (event.button !== 0 || event.pointerType === "touch") return;

      const scroller = findHorizontalScroller(event.target);
      if (!scroller) return;

      markScroller(scroller);
      activeScroller = scroller;
      activePointerId = event.pointerId;
      startClientX = event.clientX;
      startScrollLeft = Number(scroller.scrollLeft) || 0;
      dragged = false;
      previousCursor = scroller.style?.cursor ?? "";
      previousUserSelect = scroller.style?.userSelect ?? "";

      if (scroller.dataset) scroller.dataset.mogDragging = "true";
      if (scroller.style) {
        scroller.style.cursor = "grabbing";
        scroller.style.userSelect = "none";
      }

      if (typeof scroller.setPointerCapture === "function") {
        try {
          scroller.setPointerCapture(event.pointerId);
        } catch {
          // Some browsers only allow capture on the original pointer target; document listeners still work.
        }
      }
    }

    function handlePointerMove(event: any) {
      if (!activeScroller || event.pointerId !== activePointerId) return;

      const deltaX = Number(event.clientX) - startClientX;
      if (!dragged && Math.abs(deltaX) < DRAG_THRESHOLD_PX) return;

      dragged = true;
      activeScroller.scrollLeft = startScrollLeft - deltaX;
      event.preventDefault?.();
    }

    function finishPointer(event: any) {
      if (!activeScroller || event.pointerId !== activePointerId) return;

      if (dragged) {
        suppressNextClick = true;
        event.preventDefault?.();
        if (clickResetTimer) clearTimeout(clickResetTimer);
        clickResetTimer = setTimeout(() => {
          suppressNextClick = false;
        }, 0);
      }

      resetActiveScroller();
    }

    function handleClickCapture(event: any) {
      if (!suppressNextClick) return;
      suppressNextClick = false;
      event.preventDefault?.();
      event.stopPropagation?.();
    }

    function handleDragStart(event: any) {
      if (findHorizontalScroller(event.target)) event.preventDefault?.();
    }

    document.addEventListener("pointerover", handlePointerOver, true);
    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("pointermove", handlePointerMove, { capture: true, passive: false });
    document.addEventListener("pointerup", finishPointer, true);
    document.addEventListener("pointercancel", finishPointer, true);
    document.addEventListener("click", handleClickCapture, true);
    document.addEventListener("dragstart", handleDragStart, true);

    return () => {
      if (clickResetTimer) clearTimeout(clickResetTimer);
      resetActiveScroller();
      document.removeEventListener("pointerover", handlePointerOver, true);
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("pointermove", handlePointerMove, true);
      document.removeEventListener("pointerup", finishPointer, true);
      document.removeEventListener("pointercancel", finishPointer, true);
      document.removeEventListener("click", handleClickCapture, true);
      document.removeEventListener("dragstart", handleDragStart, true);
      styleElement.remove();
    };
  }, []);

  return <>{children}</>;
}
