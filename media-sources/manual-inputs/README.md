# Manual exact photo input sources

Place temporary, reviewed manual source photos here only while preparing a local import manifest that uses `manualSourcePath` or `localSourcePath`.

Rules:

- Only exact photos of the named outlet are allowed here.
- The project must own the photo, or the provider must have granted the project rights to use it.
- Do not place AI-generated, generic, placeholder, or unrelated-outlet photos here.
- Do not place random web downloads or official/operator images without documented permission here.
- Keep sources under `media-sources/manual-inputs/`; paths outside this folder are refused.
- Do not point `manualSourcePath` or `localSourcePath` at `media-sources/generated-inputs/`, `assets/outlet-images/`, or any path that escapes the repository.
- Do not commit manual source images unless a future task explicitly asks for permanent source retention.
- Remove temporary import scratch files before committing.

Required manifest metadata for a project-owned exact manual photo may omit `sourceUrl` and `licenseUrl` only when all of the following are true:

- `sourceStatus`: `"project-owned"`
- `license`: `"Project-owned"`
- `credit`: identifies the project/user/provider credit
- `alt`: describes the exact outlet photo
- `notes`: clearly states this is an exact outlet photo, project-owned or user-provided with rights, not AI-generated, not generic, and not downloaded from an unknown web source
