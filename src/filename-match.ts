import { debug } from '@actions/core';
import { CodeOwnerRule } from './codeowners/code-owner-rule.interface.js';

/**
 * A rooted literal pattern starts with a leading `/`, indicating it is anchored
 * to the root directory. It does not contain wildcards or other dynamic elements.
 */
export const isRootedLiteralPattern = (pattern: string) => {
  return !/[*?\\]/.test(pattern) && pattern[0] === '/';
};

export const matchRootedLiteralPattern = (pattern: string, path: string) => {
  // Remove the leading `/` if present, as matching is relative to the root
  const normalizedPattern = pattern[0] === '/' ? pattern.substring(1) : pattern;

  // Check for exact match if the lengths of the pattern and path are equal
  if (path.length === normalizedPattern.length) {
    return path === normalizedPattern;
  }

  // Check for a prefix match if the pattern ends with a `/`
  // This ensures the pattern refers to a directory-like structure
  if (normalizedPattern.endsWith('/')) {
    return path.startsWith(normalizedPattern);
  }

  // Verify if the path is a subpath of the pattern
  // A valid subpath must:
  // - Be longer than the normalized pattern, as a subpath extends the structure of the pattern
  // - Start with the normalized pattern
  // - Have a `/` immediately after the pattern's length, ensuring it represents a deeper structure  return (
  return (
    path.length > normalizedPattern.length &&
    path[normalizedPattern.length] === '/' &&
    path.startsWith(normalizedPattern)
  );
};

export const filenameMatch = (rule: CodeOwnerRule, path: string) => {
  if (isRootedLiteralPattern(rule.pattern)) {
    return matchRootedLiteralPattern(rule.pattern, path);
  }

  return rule.regexPattern.test(path);
};

export const findMatchingCodeOwners = (
  changedFilePaths: string[],
  codeOwnerRules: CodeOwnerRule[]
) => {
  // Set to store a unique list of owners
  const uniqueGroups = new Set<string>();
  const uniqueOwners = new Set<string>();

  for (const changedFilePath of changedFilePaths) {
    for (const rule of codeOwnerRules) {
      if (filenameMatch(rule, changedFilePath)) {
        debug(`Found matching rule for ${changedFilePath}`);
        debug(JSON.stringify(rule, null, 2));

        // Store a serialized version of the owners in the set to avoid duplicates
        uniqueGroups.add(JSON.stringify(rule.owners.sort()));
        rule.owners.forEach((owner) => uniqueOwners.add(owner));
        break; // Prevents duplicate checks for the same file path
      }
    }
  }

  // Deserialize the owners and store them in an array
  return {
    individual: Array.from(uniqueOwners),
    grouped: Array.from(uniqueGroups, (group) => JSON.parse(group)),
  };
};
