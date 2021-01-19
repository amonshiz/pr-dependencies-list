const core = require('@actions/core');
const github = require('@actions/github');

// most @actions toolkit packages have async methods
const run = async () => {
  const pullRequest = github.context.payload.pull_request
  if (!pullRequest) {
    core.setFailed("Not a pull request");
    return;
  }
  console.log(`pullRequest: ${JSON.stringify(pullRequest, undefined, 2)}`)

  const token = core.getInput('github_token', {required: true})
  if (!token) {
    core.setFailed("Missing GITHUB_TOKEN");
    return;
  }

  if (!pullRequest.body || pullRequest.body.length < 1) {
    console.log('No pull request body to parse');
    return;
  }

  const dependsOnRegex = /Depends on: #?(?<parentpr>[0-9]+)/gm;
  let m;
  while ((m = dependsOnRegex.exec(pullRequest.body)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === dependsOnRegex.lastIndex) {
      dependsOnRegex.lastIndex++;
    }

    // The result can be accessed through the `m`-variable.
    m.forEach((match, groupIndex) => {
      console.log(`Found match, group ${groupIndex}: ${match}`);
    });
  }

  // const parentPrMatch = pullRequest.body.match(dependsOnRegex);
  // console.log(`parentPrMatch: ${JSON.stringify(parentPrMatch, undefined, 2)}`)
  // if (Object.keys(parentPrMatch.groups).length < 1) {
  //   core.setFailed("No parent PR to traverse");
  //   return;
  // }

  console.log(`event payload: ${JSON.stringify(github.context.payload, undefined, 2)}`)
  //
  // try {
  //   const ms = core.getInput('milliseconds');
  //   core.info(`Waiting ${ms} milliseconds ...`);
  //
  //   core.debug((new Date()).toTimeString()); // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
  //   await wait(parseInt(ms));
  //   core.info((new Date()).toTimeString());
  //
  //   core.setOutput('time', new Date().toTimeString());
  // } catch (error) {
  //   core.setFailed(error.message);
  // }
};

run();
