import { execSync } from "node:child_process";
import { endGroup, getInput, startGroup } from "@actions/core";
import { getAnalyze } from "./analyze";
import { coverage as getCoverage, getOldCoverage } from "./coverage";
import { test as getTest } from "./test";
import { getOctokit, context } from "@actions/github";
import { createComment, postComment } from "./comment";

const run = async () => {
  const token = process.env.GITHUB_TOKEN || getInput("token");
  const octokit = getOctokit(token);

  // startGroup("Set up Flutter");
  // execSync("flutter pub get");
  // execSync("dart format . -l 120");
  // execSync("dart fix --apply");
  // endGroup();

  // const oldCoverage: number = getOldCoverage();

  // const analyzeStr: stepResponse = getAnalyze();
  // const testStr: stepResponse = getTest();
  // const coverageStr: stepResponse = getCoverage(oldCoverage);

  // const comment = createComment(analyzeStr, testStr, coverageStr);
  const comment = `Test comment</br>${new Date().toLocaleTimeString(
    "en-GB"
  )}</br><sub>Created with <a href='https://github.com/ZebraDevs/flutter-code-quality'>Flutter code quality action</a></sub>`;
  postComment(octokit, comment, context);
};

run();

export type stepResponse = {
  output: string;
  error: boolean;
};
