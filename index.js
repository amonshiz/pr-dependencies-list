const core = require('@actions/core');
const github = require('@actions/github');

// most @actions toolkit packages have async methods
async function run() {
  const pullRequest = github.context.payload.pull_request
  if (!pullRequest) {
    core.setFailed("Not a pull request");
    return;
  }
  // console.log(`pullRequest: ${JSON.stringify(pullRequest, undefined, 2)}`)

  const token = core.getInput('github_token', {required: true})
  if (!token) {
    core.setFailed("Missing GITHUB_TOKEN");
    return;
  }

  const baseBody = pullRequest.body
  if (!baseBody || baseBody.length < 1) {
    console.log('No pull request body to parse');
    return;
  }
  console.log(`baseBody: ${baseBody}`)

  const dependsOnRegex = /Depends on: #?(?<parentpr>[0-9]+)/gm;
  let m;
  while ((m = dependsOnRegex.exec(baseBody)) !== null) {
    console.log(`m: ${m}`);

    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === dependsOnRegex.lastIndex) {
      dependsOnRegex.lastIndex++;
    }
    console.log('not zero-width match');

    const groups = m.groups
    console.log('groups')
    console.log(groups)
    const parentprGroup = groups['parentpr']
    if (!parentprGroup) {
      console.log('No parentpr group');
      continue;
    }

    console.log(`parentpr group: ${parentprGroup}`)

    const token = core.getInput('github_token', { required: true });
    const client = new github.getOctokit(token)

    try {
      const dependencyPR = await client.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
        owner: github.context.payload.repository.owner,
        repo: github.context.payload.repository.name,
        pull_number: parentprGroup
      });

      const fetchedBody = dependencyPR.body;

      console.log(`parentpr body: ${fetchedBody}`);
    } catch (error) {
      console.log(`Failed to fetch PR: ${error}`);
    }
  }

  // const parentPrMatch = pullRequest.body.match(dependsOnRegex);
  // console.log(`parentPrMatch: ${JSON.stringify(parentPrMatch, undefined, 2)}`)
  // if (Object.keys(parentPrMatch.groups).length < 1) {
  //   core.setFailed("No parent PR to traverse");
  //   return;
  // }

  // console.log(`event payload: ${JSON.stringify(github.context.payload, undefined, 2)}`)
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
}

run();
