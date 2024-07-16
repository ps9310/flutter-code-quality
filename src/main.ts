import { getBooleanInput, getInput, setFailed } from "@actions/core";
import { getAnalyze } from "./scripts/analyze";
import { getOctokit, context } from "@actions/github";
import { getCoverage, getOldCoverage } from "./scripts/coverage";
import { getTest } from "./scripts/runTests";
import { createComment as getComment, postComment } from "./scripts/comment";
import { setup } from "./scripts/setup";
import { checkBranchStatus } from "./scripts/behind";
import { push } from "./scripts/push";
import { create } from "node:domain";

export type stepResponse = { output: string; error: boolean };

const run = async () => {
  try {
    const workingDirectory = getInput('working-directory');
    // Check if the working directory is different from the current directory
    if (workingDirectory && workingDirectory !== process.cwd()) {
      process.chdir(workingDirectory);
    }
    
    const token = process.env.GITHUB_TOKEN || getInput("token");
    const runTests = getBooleanInput("run-tests");
    const runAnalyze = getBooleanInput("run-analyze");
    const runCoverage = getBooleanInput("run-coverage");
    const runBehindBy = getBooleanInput("run-behind-by");
    const createComment = getBooleanInput("create-comment");

    const octokit = getOctokit(token);
    const behindByStr: stepResponse | undefined = runBehindBy ? await checkBranchStatus(octokit, context) : undefined;
    await setup();
    const oldCoverage: number | undefined = runCoverage ? getOldCoverage() : undefined;

    const analyzeStr: stepResponse | undefined = runAnalyze ? await getAnalyze() : undefined;
    const testStr: stepResponse | undefined = runTests ? await getTest() : undefined;
    const coverageStr: stepResponse | undefined = runCoverage ? getCoverage(oldCoverage) : undefined;

    const comment: string | undefined = createComment
      ? getComment(analyzeStr, testStr, coverageStr, behindByStr)
      : undefined;

    if (createComment) postComment(octokit, comment!, context);

    await push();

    if (analyzeStr?.error || testStr?.error || coverageStr?.error) {
      setFailed(`${analyzeStr?.output}\n${testStr?.output}\n${coverageStr?.output}`);
    }
  } catch (err) {
    setFailed(`Action failed with error ${err}`);
  }
};

run();
