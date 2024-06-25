import { stepResponse } from "./main";
import { endGroup, startGroup } from "@actions/core";
import { Context } from "@actions/github/lib/context";
import { GitHub } from "@actions/github/lib/utils";

const SIGNATURE = `<sub>Created with <a href='https://github.com/ZebraDevs/flutter-code-quality'>Flutter code quality action</a></sub>`;

export const createComment = (
  analyze: stepResponse,
  test: stepResponse,
  coverage: stepResponse
): string => {
  let output = `<h2>PR Checks complete</h2>
<ul>
  <li>✅ - Linting / Formatting</li>
  <li>${analyze.output.replaceAll("`|\"|'|<|>", "")}</li>
  <li>${test.output.replaceAll("`|\"|'|<|>", "")}</li>
  TODO: UP TO DATE here
  <li>${coverage.output.replaceAll("`|\"|'|<|>", "")}</li>
</ul>
${SIGNATURE}
    `.replaceAll("\r\n|\n|\r", "");
  return output;
};

export async function postComment(
  github: InstanceType<typeof GitHub>,
  commentMessage: string,
  context: Context
) {
  const issue = {
    repo: context.repo.repo,
    owner: context.repo.owner,
    issue_number: context.issue.number,
    // repo: "zeta_flutter",
    // owner: "zebrafed",
    // issue_number: 57,
  };

  const newComment = {
    ...issue,
    body: commentMessage,
  };

  startGroup(`Commenting on PR`);

  let commentId;
  try {
    const comments = (await github.rest.issues.listComments(issue)).data;

    for (let i = comments.length; i--; ) {
      const c = comments[i];
      if (c.body?.includes(SIGNATURE)) {
        commentId = c.id;
        break;
      }
    }
  } catch (e) {
    console.error("Could not find existing comment", e);
  }

  if (commentId) {
    try {
      await github.rest.issues.updateComment({
        ...issue,
        comment_id: commentId,
        body: newComment.body,
      });
    } catch (e) {
      commentId = null;
    }
  }

  if (!commentId) {
    try {
      await github.rest.issues.createComment(newComment);
    } catch (e) {
      console.error("Error creating comment", e);
    }
  }
  endGroup();
}
