import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());


import { initialSeasonSync } from "../services/sync/hockeytech-sync";

async function run() {
  try {
    await initialSeasonSync();

    process.exit(0);
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
}

run();