import { Lcov, LcovDigest, parse, sum } from "lcov-utils";
import { readFileSync } from "node:fs";
import { stepResponse } from "./main";

export const coverage = (oldCoverage: number | undefined): stepResponse => {
  try {
    const contents = readFileSync("coverage/lcov.info", "utf8");
    const lcov: Lcov = parse(contents);
    const digest: LcovDigest = sum(lcov);
    const totalPercent: number = digest.lines;
    let percentOutput: string;

    const arr = Object.values(lcov).map((e) => {
      const fileName = e.sf;
      const percent = Math.round((e.lh / e.lf) * 1000) / 10;
      const passing = percent > 96 ? "✅" : "⛔️";
      return `<tr><td>${fileName}</td><td>${percent}%</td><td>${passing}</td></tr>`;
    });

    if (oldCoverage != undefined) {
      if (oldCoverage > totalPercent) {
        percentOutput = totalPercent + `% (🔻 down from ` + oldCoverage + `)`;
      } else if (oldCoverage < totalPercent) {
        percentOutput = totalPercent + `% (👆 up from ` + oldCoverage + `)`;
      } else {
        percentOutput = totalPercent + `% (no change)`;
      }
    } else {
      percentOutput = totalPercent + "%";
    }

    const str = `📈 - Code coverage: ${percentOutput}
    <br>
    <details><summary>See details</summary>
    <table>
    <tr><th>File Name</th><th>%</th><th>Passing?</th></tr>
        ${arr.join("")}
    </table>
    </details>`;
    return { output: str, error: false };
  } catch (error) {
    return { output: "⚠️ - Coverage check failed", error: true };
  }
};

export const getOldCoverage = (): number => {
  const contents = readFileSync("coverage/lcov.info", "utf8");
  const lcov: Lcov = parse(contents);
  const digest: LcovDigest = sum(lcov);
  return digest.lines;
};
