# Generated web translation modules

`src/translations/translations.ts` is the sole tracked translation catalog. Web builds derive
platform-specific modules in the ignored `src/translations/.generated-web/` directory; never edit
or commit those generated files.

`npm start`, `npm run web`, and `npm run web:build` regenerate the modules automatically before
Metro starts. Raw Expo CLI commands such as `npx expo start --web` do not run npm lifecycle scripts,
so run `npm run translations:web:prepare` first. A fresh checkout remains type-safe without the
artifacts, and the preparation command recreates all eight locale modules.

Run `npm run translations:web:check` to verify every generated module byte-for-byte and by deep
dictionary equality against the canonical catalog.
