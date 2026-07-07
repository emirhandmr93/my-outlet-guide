# Generated input sources

Place reviewed, project-owned generated source files here only while preparing a local import manifest that uses `localSourcePath`.

Rules:

- Keep sources under `media-sources/generated-inputs/`; paths outside this folder are refused.
- Do not point `localSourcePath` at `assets/outlet-images` or any path that escapes the repository.
- Do not commit generated source images unless a future task explicitly asks for permanent source retention.
- Remove temporary simulation/import scratch files before committing.
- Generated media must be project-owned, generic, non-documentary, and free of real outlet names, logos, brand marks, readable text, identifiable people, and recognizable real locations.
