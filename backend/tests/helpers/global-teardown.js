const path = require('path');
const fs = require('fs');

const GLOBAL_CONFIG_PATH = path.resolve(__dirname, '../../.global-test-config.json');

/**
 * Jest globalTeardown — called once after all test suites.
 * Connects to the in-memory MongoDB server and shuts it down,
 * then removes the global config file.
 */
async function globalTeardown() {
  try {
    if (fs.existsSync(GLOBAL_CONFIG_PATH)) {
      const config = JSON.parse(fs.readFileSync(GLOBAL_CONFIG_PATH, 'utf-8'));
      if (config.mongoUri) {
        // Connect to the server and issue a shutdown command
        const mongoose = require('mongoose');
        try {
          await mongoose.connect(config.mongoUri, {
            serverSelectionTimeoutMS: 5000,
          });
          await mongoose.connection.db?.command({ shutdown: 1, force: true });
        } catch {
          /* server already shut down or unreachable */
        }
        try {
          await mongoose.disconnect();
        } catch {
          /* ignore */
        }
      }
      fs.unlinkSync(GLOBAL_CONFIG_PATH);
    }
  } catch {
    /* best-effort cleanup */
  }
}

module.exports = globalTeardown;
