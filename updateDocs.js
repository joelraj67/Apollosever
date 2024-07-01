const markdown = require("graphql-markdown");
const { Worker } = require("worker_threads");
const path = require("path");
const { execSync } = require("child_process");

const FEDERATION_URL = "http://localhost:4001/api/graphql";
const FILENAME_FEDERATION = path.resolve(
  __dirname,
  "../../docs/src/graphql/api-reference/reference-federation.md"
);
const MOCK_URL = "http://localhost:4000/graphql";
const FILENAME_MOCK = path.resolve(
  __dirname,
  "../../docs/src/graphql/api-reference/reference-mock.md"
);
const AUTH_GW_SCHEMA = path.resolve(
  __dirname,
  "../nb-auth-gateway/schema.gql"
);
const FILENAME_AUTH_GW = path.resolve(
  __dirname,
  "../../docs/src/auth/auth-gateway/reference-gateway.md"
);

const render = async () => {
  let mock = undefined;
  let federation = undefined;

  try {
    mock = await startMock();
    console.log("Building federation supergraph");
    execSync("cd ../nb-federation-service && npm run build");
    federation = await startFederation();
    execSync("cd ../nb-auth-gateway && rm -rf dist && npm run generate-schema");
    await updateDocs();
  } catch (err) {
    console.error(err);
  } finally {
    console.log('Finallizing processes');
    mock?.terminate();
    federation?.terminate();
    process.exit(0);
  }
};

const startMock = () => {
  console.log("Starting mock server");

  return new Promise((resolve) => {
    const worker = new Worker(path.resolve(__dirname, "src/server.js"));
    worker.on("message", () => {
      resolve(worker);
    });
  });
};

const startFederation = () => {
  console.log("Starting federation service");

  return new Promise((resolve) => {
    const worker = new Worker("./federation-worker.js", {
      env: {
        MOCK_API_URL: MOCK_URL,
        OTC_API_URL: 'https://nhotcservice-nb-v2.azurewebsites.net/graphql/',
        MEMBER_REFRESH_API_URL: 'https://nhmemberrefreshservice-nb-v2.azurewebsites.net/graphql/',
        GLOBAL_API_URL: 'https://nbotc-test2-otc2-global-login-api.azurewebsites.net/graphql/',
      },
    });
    worker.on("message", () => {
      resolve(worker);
    });
  });
};

const updateDocs = async () => {
  console.log("Generating mock reference");
  const mockSchema = await markdown.loadSchemaJSON(MOCK_URL);
  await markdown.updateSchema(FILENAME_MOCK, mockSchema, {
    headingLevel: 1,
    skipTitle: true,
    skipTableOfContents: true,
  });

  console.log("Generating federation reference");
  const federationSchema = await markdown.loadSchemaJSON(FEDERATION_URL);
  await markdown.updateSchema(FILENAME_FEDERATION, federationSchema, {
    headingLevel: 1,
    skipTitle: true,
    skipTableOfContents: true,
  });

  console.log("Generating auth gateway reference");
  const authGatewaySchema = await markdown.loadSchemaJSON(AUTH_GW_SCHEMA);
  await markdown.updateSchema(FILENAME_AUTH_GW, authGatewaySchema, {
    headingLevel: 1,
    skipTitle: true,
    skipTableOfContents: true,
  });
};

(async () => {
  console.log("Updating API reference docs");
  await render();
})();
