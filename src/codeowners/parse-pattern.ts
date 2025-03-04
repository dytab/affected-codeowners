// https://github.com/hmarr/codeowners/blob/main/match.go
export const parsePattern = (pattern: string): RegExp => {
  // Handle specific edge cases first
  if (pattern.includes('***')) {
    throw new Error('pattern cannot contain three consecutive asterisks');
  } else if (pattern === '') {
    throw new Error('empty pattern');
  } else if (pattern === '/') {
    // "/" doesn't match anything
    return new RegExp('^$');
  }

  let segments = pattern.split('/');

  if (segments[0] === '') {
    // Leading slash: match is relative to root
    segments = segments.slice(1);
  } else {
    // No leading slash - check for a single segment pattern
    if (
      segments.length === 1 ||
      (segments.length === 2 && segments[1] === '')
    ) {
      if (segments[0] !== '**') {
        segments = ['**', ...segments];
      }
    }
  }

  if (segments.length > 1 && segments[segments.length - 1] === '') {
    // Trailing slash is equivalent to "/**"
    segments[segments.length - 1] = '**';
  }

  const lastSegIndex = segments.length - 1;
  const separator = '/';
  let needSlash = false;
  const re = ['^'];

  segments.forEach((seg, i) => {
    switch (seg) {
      case '**':
        if (i === 0 && i === lastSegIndex) {
          // If the pattern is just "**", match everything
          re.push('.+');
        } else if (i === 0) {
          // If the pattern starts with "**", match any leading path segment
          re.push(`(?:.+${separator})?`);
          needSlash = false;
        } else if (i === lastSegIndex) {
          // If the pattern ends with "**", match any trailing path segment
          re.push(`${separator}.*`);
        } else {
          // Match zero or more path segments
          re.push(`(?:${separator}.+)?`);
          needSlash = true;
        }
        break;

      case '*':
        if (needSlash) {
          re.push(separator);
        }
        // Match any characters except the separator
        re.push(`[^${separator}]+`);
        needSlash = true;
        break;

      default: {
        if (needSlash) {
          re.push(separator);
        }

        let escape = false;
        for (const ch of seg) {
          if (escape) {
            escape = false;
            // escape the next char
            re.push(ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
            continue;
          }

          switch (ch) {
            case '\\':
              escape = true;
              break;
            case '*':
              // Multi-character wildcard
              re.push(`[^${separator}]*`);
              break;
            case '?':
              // Single-character wildcard
              re.push(`[^${separator}]`);
              break;
            default:
              // escape if necessary
              re.push(ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
              break;
          }
        }

        if (i === lastSegIndex) {
          // match descendent paths
          re.push(`(?:${separator}.*)?`);
        }

        needSlash = true;
      }
    }
  });

  re.push('$');
  return new RegExp(re.join(''));
};
