import * as core from '@actions/core';
import { context } from '@actions/github';
import { GitHubService } from './github-service.js';
import { parseFile } from './codeowners/parse-file.js';
import { findMatchingCodeOwners } from './filename-match.js';

export async function run() {
  try {
    const github = new GitHubService(core.getInput('token'), context);

    const { content: codeownersContent, location: codeownersLocationGuessed } =
      await github.getCodeownersFile();

    const { lines: codeownersErrors, location: codeownersLocationActual } =
      await github.getCodeownersErrors();

    if (
      codeownersLocationActual &&
      codeownersLocationGuessed !== codeownersLocationActual
    ) {
      throw new Error(
        `CODEOWNERS guessed file location does not match with actual location: ${codeownersLocationGuessed} !== ${codeownersLocationActual}`
      );
    }

    core.setOutput('grouped-owners', '');
    core.setOutput('individual-owners', '');

    if (!codeownersContent) {
      core.info('No CODEOWNERS file found, skipping codeowners check');
      return;
    }

    core.info(`CODEOWNERS file found at ${codeownersLocationGuessed}`);

    const changedFilePaths = await github.listChangedFiles();

    if (changedFilePaths.length === 0) {
      core.info('No changed files found, skipping codeowners check');
      return;
    }

    const ruleset = parseFile(codeownersContent, codeownersErrors);

    if (ruleset.length === 0) {
      core.info('No codeowners rules found, skipping codeowners check');
      return;
    }

    const owners = findMatchingCodeOwners(changedFilePaths, ruleset);

    core.setOutput('grouped-owners', JSON.stringify(owners.grouped));
    core.setOutput('individual-owners', JSON.stringify(owners.individual));
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message);
  }
}
