const path = require("path");

require("tsconfig-paths").register({
  cwd: path.resolve(__dirname, "../nb-federation-service")
});

require("ts-node").register({
  project: path.resolve(__dirname, "../nb-federation-service/tsconfig.json"),
  transpileOnly: true,
});

require(path.resolve(__dirname, "../nb-federation-service/src/main.ts"));
