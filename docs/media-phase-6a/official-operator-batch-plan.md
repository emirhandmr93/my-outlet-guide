# Media Phase 6A official/operator batch plan

This is a planning-only tracker for preparing official/operator website media coverage for all 108 outlets. It does not contain real import manifests, does not download images, does not change outlet data, and does not change current media metadata statuses.

## Batch rules

- Use only exact outlet images from official outlet or operator websites, covered by project-owner permission.
- Do not use Google Images, random web pages, AI-generated images, generic atmosphere images, unrelated outlet/mall photos, or runtime hotlinks.
- Import manifests may store `sourceUrl` and `downloadUrl` for technical import traceability only.
- Do not add user-facing permission, credit, license, source, or permission-note text for official/operator media.
- Promote imported official/operator assets with `sourceStatus: "official-operator"` so production resolution treats them as safe while public Media Credits hide them by default.
- Keep existing Wikimedia, Creative Commons, and public-domain credits visible and unchanged.

## Batches

| Batch                      | Countries                                                                                                                                                        | Outlet count | Status  | Notes                                                              |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -----------: | ------- | ------------------------------------------------------------------ |
| Italy                      | Italy                                                                                                                                                            |           22 | Planned | Build reviewed manifests from official outlet/operator pages only. |
| UK                         | UK                                                                                                                                                               |           24 | Planned | Build reviewed manifests from official outlet/operator pages only. |
| Spain                      | Spain                                                                                                                                                            |           10 | Planned | Build reviewed manifests from official outlet/operator pages only. |
| Germany / France / Benelux | Germany, France, Belgium, Netherlands                                                                                                                            |           25 | Planned | Build reviewed manifests from official outlet/operator pages only. |
| Rest of Europe             | Austria, Croatia, Czech Republic, Denmark, Estonia, Finland, Greece, Hungary, Ireland, Latvia, Lithuania, Norway, Poland, Portugal, Romania, Sweden, Switzerland |           27 | Planned | Build reviewed manifests from official outlet/operator pages only. |
| Total                      | All planned official/operator batches                                                                                                                            |          108 | Planned | No real official image manifests created in Phase 6A.              |

## Phase 6A completion criteria

- Policy and tooling accept official/operator media as an internal production-safe source status.
- Public credits exclude official/operator permission-based media by default.
- Template remains `templateOnly: true` and cannot be imported directly.
- Real manifests, downloads, image files, outlet data edits, and metadata status migrations are deferred to later phases.
