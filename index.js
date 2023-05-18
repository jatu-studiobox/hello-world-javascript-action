const core = require("@actions/core");
const github = require("@actions/github");
const axios = require("axios");
const FormData = require("form-data");

try {
  // `who-to-greet` input defined in action metadata file
  const nameToGreet = core.getInput("who-to-greet");
  const token = core.getInput("access-token");
  const repositoryName = core.getInput("repository-name");
  const issueNo = core.getInput("issue-number");
  const issueTitle = core.getInput("issue-title");
  const issueHtmlUrl = core.getInput("issue-html-url");

  console.log(`Hello ${nameToGreet}!`);
  console.log(`repositoryName: ${repositoryName}!`);

  const time = new Date().toTimeString();
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2);
  console.log(`The event payload: ${payload}`);

  let message = "\nIssue is opened.";
  message += "\n📦: " + repositoryName;
  message += "\n[#" + issueNo + "]: " + issueTitle;
  message += "\n" + issueHtmlUrl;

  const formLineNotify = new FormData();

  formLineNotify.append("message", message);

  let lineConfig = {
    url: "https://notify-api.line.me/api/notify",
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: "Bearer " + token,
      ...formLineNotify.getHeaders(),
    },
    data: formLineNotify,
  };

  axios(lineConfig)
    .then((res) => {
      const data = res.data;
      console.log(data);
      if (data.status !== 200) {
        core.setFailed(data.message);
      }
    })
    .catch((error) => {
      core.setFailed(error.message);
    });
} catch (error) {
  core.setFailed(error.message);
}
