// The former CSV import wrote flat outlets.ts/brands.ts files, shadowing the
// country registries and reducing the runtime to a partial spreadsheet. Keep
// the established command safe: export all current runtime records instead.
import { syncMasterData } from "./syncMasterData";
syncMasterData(process.argv.includes("--check"));
