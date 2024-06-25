import core from "@actions/core";
import { parse, sum } from "lcov-utils";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { stepResponse } from "./main";

export const test = (): stepResponse => {
  try {
    execSync("flutter test --coverage --reporter json", { encoding: "utf-8" });
    return { output: "✅ - All tests passed", error: false };
  } catch (error) {
    if ((error as any).stdout) {
      const stdout: string = (error as any).stdout;
      const objStr = "[" + stdout.split("\n").join(",").slice(0, -1) + "]";
      const obj = JSON.parse(objStr);
      let failIds: string[] = [];
      obj.forEach(
        (element: { type: string; result: string; testID: string }) => {
          if (
            element.type == "testDone" &&
            element.result.toLowerCase() == "error"
          ) {
            failIds.push(element.testID);
          }
        }
      );
      let initialString = "";
      if (failIds.length > 1) {
        initialString = `${failIds.length} tests failed`;
      } else if (failIds.length == 1) {
        initialString = `${failIds.length} test failed`;
      }
      const errorString: string[] = [];

      failIds.forEach((e1) => {
        const allEntries = obj.filter(
          (e: {
            hasOwnProperty: (arg0: string) => any;
            testID: any;
            test: { hasOwnProperty: (arg0: string) => any; id: any };
          }) =>
            (e.hasOwnProperty("testID") && e.testID == e1) ||
            (e.hasOwnProperty("test") &&
              e.test.hasOwnProperty("id") &&
              e.test.id == e1)
        );
        const entry1 = allEntries.find(
          (e: {
            hasOwnProperty: (arg0: string) => any;
            test: { hasOwnProperty: (arg0: string) => any };
          }) => e.hasOwnProperty("test") && e.test.hasOwnProperty("id")
        );
        let testName = "Error getting test name";
        if (entry1) {
          testName = entry1.test.name.split("/test/").slice(-1);
        }
        const entry2 = allEntries.find(
          (e: {
            hasOwnProperty: (arg0: string) => any;
            stackTrace: string | any[];
          }) => e.hasOwnProperty("stackTrace") && e.stackTrace.length > 1
        );
        const entry3 = allEntries.find(
          (e: {
            hasOwnProperty: (arg0: string) => any;
            message: string | string[];
          }) =>
            e.hasOwnProperty("message") &&
            e.message.length > 1 &&
            e.message.includes("EXCEPTION CAUGHT BY FLUTTER")
        );
        const entry4 = allEntries.find(
          (e: {
            hasOwnProperty: (arg0: string) => any;
            error: string | any[];
          }) => e.hasOwnProperty("error") && e.error.length > 1
        );
        let testDetails =
          "Unable to get test details. Run flutter test to replicate";
        if (entry2) {
          testDetails = entry2.stackTrace;
        } else if (entry3) {
          testDetails = entry3.message;
        } else if (entry4) {
          testDetails = entry4.error;
        }

        errorString.push(
          "<details><summary>" +
            testName +
            "</br></summary>`" +
            testDetails +
            "`</details>"
        );
      });

      const output = `⛔️ - ${initialString}</br >
            <details><summary>See details</summary>
              ${errorString.join("")}
            </details>
        `;
      return { output: output, error: true };
    }
  }
  return { output: "⚠️ - Error running tests", error: true };
};
