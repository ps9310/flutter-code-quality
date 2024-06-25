import { execSync } from "node:child_process";
import type { stepResponse } from "./main";

export const getAnalyze = (): stepResponse => {
  try {
    execSync("dart analyze", { encoding: "utf-8" });
    return { output: "✅ - Static analysis passed", error: false };
  } catch (error) {
    if ((error as any).stdout) {
      const stdout = (error as any).stdout;
      const arr = stdout.trim().split("\n");
      const issuesList = arr.slice(2, -2).map((e: string) =>
        e
          .split("-")
          .slice(0, -1)
          .map((e: string) => e.trim())
      );
      const errors: string[] = [];
      const warnings: string[] = [];
      const infos: string[] = [];

      issuesList.forEach((e: string) => {
        if (e[0].toLowerCase() == "error") {
          errors.push(e);
        } else if (e[0].toLowerCase() == "warning") {
          warnings.push(e);
        } else {
          infos.push(e);
        }
      });
      const errorString = errors.map((e) => {
        return `<tr>
                <td>⛔️</td><td>Error</td><td>${e[1]}</td><td>${e[2]}</td>
            </tr>`;
      });
      const warningString = warnings.map((e) => {
        return `<tr>
                <td>⚠️</td><td>Warning</td><td>${e[1]}</td><td>${e[2]}</td>
            </tr>`;
      });
      const infoString = infos.map((e) => {
        return `<tr>
                <td>ℹ️</td><td>Info</td><td>${e[1]}</td><td>${e[2]}</td>
            </tr>`;
      });

      const issuesFound = arr.at(-1);

      const output = `⛔️ - Static analysis failed; ${issuesFound}</br>
        <details><summary>See details</summary>
        <table>
        <tr><th></th><th>Type</th><th>File name</th><th>Details</th></tr>${errorString.join(
          ""
        )}${warningString.join("")}${infoString.join("")}</table></details>
        `;

      return { output: output, error: true };
    }
  }
  return { output: "⚠️ - Error running analysis", error: true };
};
