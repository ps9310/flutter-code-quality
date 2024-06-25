System.register("analyze", ["@actions/core", "node:child_process"], function (exports_1, context_1) {
    "use strict";
    var core_1, node_child_process_1, analyze;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (node_child_process_1_1) {
                node_child_process_1 = node_child_process_1_1;
            }
        ],
        execute: function () {
            exports_1("analyze", analyze = () => {
                try {
                    node_child_process_1.execSync("dart analyze", { encoding: "utf-8" });
                    return "✅ - Static analysis passed";
                }
                catch (error) {
                    if (error.stdout) {
                        const stdout = error.stdout;
                        const arr = stdout.trim().split("\n");
                        const issuesList = arr.slice(2, -2).map((e) => e
                            .split("-")
                            .slice(0, -1)
                            .map((e) => e.trim()));
                        const errors = [];
                        const warnings = [];
                        const infos = [];
                        issuesList.forEach((e) => {
                            if (e[0].toLowerCase() == "error") {
                                errors.push(e);
                            }
                            else if (e[0].toLowerCase() == "warning") {
                                warnings.push(e);
                            }
                            else {
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
                        let output = `⛔️ - Static analysis failed; ${issuesFound}</br>
        <details><summary>See details</summary>
        <table>
        <tr><th></th><th>Type</th><th>File name</th><th>Details</th></tr>
            ${errorString.join("")}
            ${warningString.join("")}
            ${infoString.join("")}
        </table>
        </details>
        `;
                        output = output.replace(/(\r\n|\n|\r)/gm, "");
                        return output;
                        core_1.default.setOutput("err", "true");
                        core_1.default.info("⛔️");
                    }
                }
                return "";
            });
        }
    };
});
System.register("coverage", ["lcov-utils", "node:fs"], function (exports_2, context_2) {
    "use strict";
    var lcov_utils_1, node_fs_1, coverage, getOldCoverage;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [
            function (lcov_utils_1_1) {
                lcov_utils_1 = lcov_utils_1_1;
            },
            function (node_fs_1_1) {
                node_fs_1 = node_fs_1_1;
            }
        ],
        execute: function () {
            exports_2("coverage", coverage = async (oldCoverage) => {
                try {
                    const contents = node_fs_1.readFileSync("coverage/lcov.info", "utf8");
                    const lcov = lcov_utils_1.parse(contents);
                    const digest = lcov_utils_1.sum(lcov);
                    const totalPercent = digest.lines;
                    let percentOutput;
                    const arr = Object.values(lcov).map((e) => {
                        const fileName = e.sf;
                        const percent = Math.round((e.lh / e.lf) * 1000) / 10;
                        const passing = percent > 96 ? "✅" : "⛔️";
                        return `<tr><td>${fileName}</td><td>${percent}%</td><td>${passing}</td></tr>`;
                    });
                    if (oldCoverage != undefined) {
                        if (oldCoverage > totalPercent) {
                            percentOutput = totalPercent + `% (🔻 down from ` + oldCoverage + `)`;
                        }
                        else if (oldCoverage < totalPercent) {
                            percentOutput = totalPercent + `% (👆 up from ` + oldCoverage + `)`;
                        }
                        else {
                            percentOutput = totalPercent + `% (no change)`;
                        }
                    }
                    else {
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
                    return str;
                }
                catch (error) {
                    return "⚠️ - Coverage check failed";
                }
            });
            exports_2("getOldCoverage", getOldCoverage = () => {
                const contents = node_fs_1.readFileSync("coverage/lcov.info", "utf8");
                const lcov = lcov_utils_1.parse(contents);
                const digest = lcov_utils_1.sum(lcov);
                return digest.lines;
            });
        }
    };
});
System.register("test", ["node:child_process"], function (exports_3, context_3) {
    "use strict";
    var node_child_process_2, test;
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [
            function (node_child_process_2_1) {
                node_child_process_2 = node_child_process_2_1;
            }
        ],
        execute: function () {
            exports_3("test", test = () => {
                try {
                    node_child_process_2.execSync("flutter test --coverage --reporter json", { encoding: "utf-8" });
                    return "✅ - All tests passed";
                }
                catch (error) {
                    if (error.stdout) {
                        const stdout = error.stdout;
                        const objStr = "[" + stdout.split("\n").join(",").slice(0, -1) + "]";
                        const obj = JSON.parse(objStr);
                        let failIds = [];
                        obj.forEach((element) => {
                            if (element.type == "testDone" &&
                                element.result.toLowerCase() == "error") {
                                failIds.push(element.testID);
                            }
                        });
                        let initialString = "";
                        if (failIds.length > 1) {
                            initialString = `${failIds.length} tests failed`;
                        }
                        else if (failIds.length == 1) {
                            initialString = `${failIds.length} test failed`;
                        }
                        const errorString = [];
                        failIds.forEach((e1) => {
                            const allEntries = obj.filter((e) => (e.hasOwnProperty("testID") && e.testID == e1) ||
                                (e.hasOwnProperty("test") &&
                                    e.test.hasOwnProperty("id") &&
                                    e.test.id == e1));
                            const entry1 = allEntries.find((e) => e.hasOwnProperty("test") && e.test.hasOwnProperty("id"));
                            let testName = "Error getting test name";
                            if (entry1) {
                                testName = entry1.test.name.split("/test/").slice(-1);
                            }
                            const entry2 = allEntries.find((e) => e.hasOwnProperty("stackTrace") && e.stackTrace.length > 1);
                            const entry3 = allEntries.find((e) => e.hasOwnProperty("message") &&
                                e.message.length > 1 &&
                                e.message.includes("EXCEPTION CAUGHT BY FLUTTER"));
                            const entry4 = allEntries.find((e) => e.hasOwnProperty("error") && e.error.length > 1);
                            let testDetails = "Unable to get test details. Run flutter test to replicate";
                            if (entry2) {
                                testDetails = entry2.stackTrace;
                            }
                            else if (entry3) {
                                testDetails = entry3.message;
                            }
                            else if (entry4) {
                                testDetails = entry4.error;
                            }
                            errorString.push("<details><summary>" +
                                testName +
                                "</br></summary>`" +
                                testDetails +
                                "`</details>");
                        });
                        let output = `⛔️ - ${initialString}</br >
            <details><summary>See details</summary>
              ${errorString.join("")}
            </details>
        `;
                        return output;
                    }
                }
                return "";
            });
        }
    };
});
System.register("main", ["node:child_process", "@actions/core", "analyze", "coverage", "test", "@actions/github"], function (exports_4, context_4) {
    "use strict";
    var node_child_process_3, core_2, analyze_1, coverage_1, test_js_1, github_1, run;
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [
            function (node_child_process_3_1) {
                node_child_process_3 = node_child_process_3_1;
            },
            function (core_2_1) {
                core_2 = core_2_1;
            },
            function (analyze_1_1) {
                analyze_1 = analyze_1_1;
            },
            function (coverage_1_1) {
                coverage_1 = coverage_1_1;
            },
            function (test_js_1_1) {
                test_js_1 = test_js_1_1;
            },
            function (github_1_1) {
                github_1 = github_1_1;
            }
        ],
        execute: function () {
            run = async () => {
                const myToken = core_2.getInput("token");
                const octokit = github_1.getOctokit(myToken);
                const theContext = github_1.context;
                core_2.startGroup("Set up Flutter");
                node_child_process_3.execSync("flutter pub get");
                node_child_process_3.execSync("dart format . -l 120");
                node_child_process_3.execSync("dart fix --apply");
                core_2.endGroup();
                const oldCoverage = coverage_1.getOldCoverage();
                const analyzeStr = analyze_1.analyze();
                const testStr = test_js_1.test();
                coverage_1.coverage(oldCoverage);
            };
        }
    };
});
