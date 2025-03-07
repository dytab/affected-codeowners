import { CodeOwnerRule } from './parse-file.js';
import { parsePattern } from './parse-pattern.js';

export const parseLine = (line: string, lineNumber: number) => {
  const RE_INLINE_COMMENT = /(?<!\\)#/;
  const RE_UNESCAPED_SPACE = /(?<!\\)\s+/;

  if (RE_INLINE_COMMENT.test(line)) {
    line = line.split(RE_INLINE_COMMENT)[0].trim();
  }

  const [pattern, ...owners] = line.split(RE_UNESCAPED_SPACE);

  const regexPattern = parsePattern(pattern);

  return {
    pattern,
    regexPattern,
    lineNumber,
    owners,
  } as CodeOwnerRule;
};
