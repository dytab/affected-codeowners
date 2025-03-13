import { parseLine } from './parse-line.js';
import { setOutput } from '@actions/core';
import { CodeOwnerRule } from './code-owner-rule.interface.js';

export const parseFile = (fileContent: string, errors: number[]) => {
  const rules: CodeOwnerRule[] = [];
  const lines = fileContent.split(/\r?\n/);

  let lineNo = 0;
  for (const rawLine of lines) {
    lineNo++;

    // skip lines which have errors according to the api
    if (errors.includes(lineNo)) {
      continue;
    }

    const line = rawLine.trim();

    // skip empty lines and comments
    if (line.length === 0 || line.startsWith('#')) {
      continue;
    }

    // spcial github CODEOWNERS syntax
    // https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners#codeowners-syntax
    if (line.startsWith('\\#') || line.startsWith('!')) {
      // GitHub is not consistent with their own special syntax
      // so we skip the validation for now
      // continue
    }

    try {
      const rule = parseLine(line, lineNo);
      rules.push(rule);
    } catch (error) {
      if (error instanceof Error) {
        setOutput('error', `Line ${lineNo}: ${error.message}`);
      }
    }
  }

  // Ensure precedence for last matching patterns
  return rules.reverse();
};
