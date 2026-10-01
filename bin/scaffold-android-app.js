#!/usr/bin/env node

const { runAndroidScaffoldCli } = require("../src/androidScaffold");

runAndroidScaffoldCli(process.argv).catch((error) => {
  console.error(error && error.message ? error.message : error);
  process.exitCode = 1;
});
