import { parsePattern } from './parse-pattern.js';
import { CodeOwnerRule } from './code-owner-rule.interface.js';

export const parseLine = (line: string, lineNumber: number) => {
  const inlineComment = /(?<!\\)#/;
  const unescapedSpace = /(?<!\\)\s+/;

  if (inlineComment.test(line)) {
    line = line.split(inlineComment)[0].trim();
  }

  const [pattern, ...owners] = line.split(unescapedSpace);

  const regexPattern = parsePattern(pattern);

  return {
    pattern,
    regexPattern,
    lineNumber,
    owners,
  } as CodeOwnerRule;
};
