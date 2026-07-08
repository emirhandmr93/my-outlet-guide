# Release build size policy

Release Build Size Phase 1A keeps production EAS client build archives small by excluding source-only material from the upload tarball while leaving runtime app files untouched.

## Runtime media stays in the app archive

The final outlet images used by the React Native app live in `assets/outlet-images/`. The `.easignore` rules must not exclude this folder because these files are runtime media required by the app bundle.

## Manual source photos stay in the repo, but not in EAS client archives

Manual source photos and source manifests under `media-sources/` are retained in git for traceability and future media pipeline work. They are excluded from EAS client build archives because the built app does not read them at runtime.

## Source-only folders excluded from EAS client archives

The client archive excludes documentation, tooling, MasterData source CSVs, Firebase Functions source, GitHub workflow files, coverage output, temporary files, local editor metadata, `node_modules`, `.git`, and logs. These files remain in the repository unless changed by normal development work; this policy only controls what is uploaded to EAS Build.
