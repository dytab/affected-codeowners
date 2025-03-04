import { parseLine } from '../src/codeowners/parse-line.js';

describe('readLineFile', () => {
  it('edge cases', () => {
    const result = parseLine('hello/wo rld', 0);
    expect(result).toEqual({
      lineNumber: 0,
      owners: ['rld'],
      pattern: 'hello/wo',
      regexPattern: expect.any(RegExp),
    });
  });

  it('should parse a simple pattern without owners', () => {
    const result = parseLine('/src/*.ts', 0);
    expect(result).toEqual({
      lineNumber: 0,
      owners: [],
      pattern: '/src/*.ts',
      regexPattern: expect.any(RegExp),
    });
  });

  it('should parse a pattern with owners', () => {
    const result = parseLine('* @owner1 @owner2', 0);
    expect(result).toEqual({
      pattern: '*',
      owners: ['@owner1', '@owner2'],
      lineNumber: 0,
      regexPattern: expect.any(RegExp),
    });
  });

  it('should parse a pattern with owners and multiple spaces', () => {
    const result = parseLine('*  \t\t @owner1    @owner2', 0);
    expect(result).toEqual({
      pattern: '*',
      owners: ['@owner1', '@owner2'],
      lineNumber: 0,
      regexPattern: expect.any(RegExp),
    });
  });

  it('should ignore inline comments', () => {
    const result = parseLine('pattern @owner1       # This is a comment', 0);
    expect(result).toEqual({
      pattern: 'pattern',
      owners: ['@owner1'],
      lineNumber: 0,
      regexPattern: expect.any(RegExp),
    });
  });

  it('should handle escaped spaces correctly', () => {
    const result = parseLine('/a/path\\ with/spa\\ ce.txt   @owner1', 0);
    expect(result).toEqual({
      pattern: '/a/path\\ with/spa\\ ce.txt',
      owners: ['@owner1'],
      lineNumber: 0,
      regexPattern: expect.any(RegExp),
    });
  });

  it('should handle basic path correctly', () => {
    const result = parseLine('/a/path   @owner1', 0);
    expect(result).toEqual({
      pattern: '/a/path',
      owners: ['@owner1'],
      lineNumber: 0,
      regexPattern: expect.any(RegExp),
    });
  });

  it('should handle escaped hash `#` correctly', () => {
    const result = parseLine('/src/file\\#with/hash.ts @owner1', 0);
    expect(result).toEqual({
      pattern: '/src/file\\#with/hash.ts',
      owners: ['@owner1'],
      lineNumber: 0,
      regexPattern: expect.any(RegExp),
    });
  });
});
