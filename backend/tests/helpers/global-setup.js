const path = require('path');
const fs = require('fs');

const GLOBAL_CONFIG_PATH = path.resolve(__dirname, '../../../.global-test-config.json');

/**
 * Jest globalSetup — called once before all test suites.
 * Starts a single in-memory MongoDB server and writes its URI to a JSON config.
 * The mongod child process persists after this process exits (detached),
 * and is cleaned up by globalTeardown via the JSON config file.
 */
async function globalSetup() {
  let MongoMemoryServer;
  try {
    MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
  } catch {
    // In CI, MONGODB_URI is set by the workflow — skip in-memory server
    const ciUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (ciUri) {
      fs.writeFileSync(GLOBAL_CONFIG_PATH, JSON.stringify({ mongoUri: ciUri }, null, 2));
      return;
    }
    throw new Error('mongodb-memory-server not available. Set MONGODB_URI or install the package.');
  }

  const server = await MongoMemoryServer.create({
    instance: { dbName: 'mit_lms_test' },
  });
  const uri = server.getUri();

  const config = {
    mongoUri: uri,
  };
  fs.writeFileSync(GLOBAL_CONFIG_PATH, JSON.stringify(config, null, 2));

  // eslint-disable-next-line no-console
  console.log(`\n[globalSetup] In-memory MongoDB started at ${uri}\n`);
}

module.exports = globalSetup;
