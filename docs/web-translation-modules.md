# Generated web translation modules

`src/translations/translations.ts` is the sole tracked translation catalog. Web builds derive
platform-specific modules in the ignored `src/translations/.generated-web/` directory; never edit
or commit those generated files.

`npm run web` and `npm run web:build` regenerate the modules automatically before Metro starts.
For other workflows, run `npm run translations:web:prepare`. A fresh checkout remains type-safe
without the artifacts, and the preparation command recreates all eight locale modules.

Run `npm run translations:web:check` to verify every generated module byte-for-byte and by deep
dictionary equality against the canonical catalog.
