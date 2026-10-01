#!/usr/bin/env node

const { runCli } = require("../src/generator");

runCli(process.argv).catch((error) => {
  console.error(error && error.message ? error.message : error);
  process.exitCode = 1;
});
