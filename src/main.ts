import { getInput } from "@actions/core";
import { getAnalyze } from "./analyze";
import { getCoverage, getOldCoverage } from "./coverage";
import { getTest } from "./test";
import { getOctokit, context } from "@actions/github";
import { createComment, postComment } from "./comment";
import { setup } from "./setup";

const run = async () => {
  const token = process.env.GITHUB_TOKEN || getInput("token");
  const octokit = getOctokit(token);

  await setup();

  const oldCoverage: number | undefined = getOldCoverage();
  const analyzeStr: stepResponse = await getAnalyze();
  const testStr: stepResponse = await getTest();
  const coverageStr: stepResponse = await getCoverage(oldCoverage);
  // const comment = `Test comment, ${Date.now().toLocaleString("en_GB")}
  // <sub>Created with <a href='https://github.com/ZebraDevs/flutter-code-quality'>Flutter code quality action</a></sub>
  //     }`;
  const comment = createComment(analyzeStr, testStr, coverageStr);
  postComment(octokit, comment, context);
};

run();

export type stepResponse = {
  output: string;
  error: boolean;
};
