# Production Media Policy

This policy defines when outlet media can be considered production-cleared and how new images must be documented before they are added to the app.

## Reuse and sourcing rules

- Do not use official/operator website images unless explicit permission or compatible reuse rights are documented.
- Publicly accessible images are not automatically reusable; availability on the web does not grant production reuse rights.
- New images must have provenance metadata before being added to the repository or referenced by outlet media.
- `sourceStatus: "unknown"` is acceptable only for legacy inventory tracking. It is not acceptable for new production-cleared additions.
- Unknown-provenance local images should be replaced, documented, or excluded before final public production release.
- Prefer project-owned, licensed, public-domain, permission-granted, or controlled CDN/local assets.
- Do not direct-hotlink random remote images or official outlet images.
- Unsplash and Wikimedia assets are acceptable only when the metadata documents the source, author/credit, license or terms, and a non-misleading use note.
- Images should not imply documentary accuracy for a specific outlet unless they are sourced and verified for that outlet.

## Required metadata for production-cleared images

Production-cleared image metadata must include:

- `sourceStatus`
- `sourceUrl`, or an explicit note that the image is project-owned/internal
- `credit` when applicable
- `license`
- `licenseUrl` when applicable
- `alt`
- `notes` when needed to explain permission, ownership, context, or non-documentary use

## Image quality recommendations

- Use optimized WebP assets when practical.
- Keep dimensions controlled for the app surfaces where images appear.
- Keep file sizes reasonable for mobile users.
- Provide useful alt text for every image.
