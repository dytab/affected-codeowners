import { getInput, info, setFailed, setOutput } from '@actions/core';
import { context } from '@actions/github';
import { GitHubService } from './github.service.js';
import { parseFile } from './codeowners/parse-file.js';
import { findMatchingCodeOwners } from './filename-match.js';

export async function run() {
  try {
    const github = new GitHubService(getInput('token'), context);

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

    setOutput('grouped-owners', '');
    setOutput('individual-owners', '');

    if (!codeownersContent) {
      info('No CODEOWNERS file found, skipping codeowners check');
      return;
    }

    info(`CODEOWNERS file found at ${codeownersLocationGuessed}`);

    const changedFilePaths = await github.listChangedFiles();

    if (changedFilePaths.length === 0) {
      info('No changed files found, skipping codeowners check');
      return;
    }

    const ruleset = parseFile(codeownersContent, codeownersErrors);

    if (ruleset.length === 0) {
      info('No codeowners rules found, skipping codeowners check');
      return;
    }

    const owners = findMatchingCodeOwners(changedFilePaths, ruleset);

    setOutput('grouped-owners', JSON.stringify(owners.grouped));
    setOutput('individual-owners', JSON.stringify(owners.individual));
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) setFailed(error.message);
  }
}
