import { parsePattern } from '../src/codeowners/parse-pattern.js';

// https://github.com/hmarr/codeowners/blob/main/testdata/patterns.json
describe('Pattern Matching Tests', () => {
  it('single-segment pattern', () => {
    const pattern = 'foo';
    const regex = parsePattern(pattern);
    const paths = {
      foo: true,
      'foo.txt': false,
      'foo/bar': true,
      'bar/foo': true,
      'bar/foo.txt': false,
      'bar/baz': false,
      'bar/foo/baz': true,
    };

    Object.entries(paths).forEach(([path, expected]) => {
      const result = regex.test(path);
      expect(result).toBe(expected);
    });
  });

  it('single-segment pattern with leading slash', () => {
    const pattern = '/foo';
    const regex = parsePattern(pattern);
    const paths = {
      foo: true,
      'fool.txt': false,
      'foo/bar': true,
      'bar/foo': false,
      'bar/baz': false,
      'foo/bar/baz': true,
      'bar/foo/baz': false,
    };

    Object.entries(paths).forEach(([path, expected]) => {
      const result = regex.test(path);
      expect(result).toBe(expected);
    });
  });

  it('single-segment pattern with trailing slash', () => {
    const pattern = 'foo/';
    const regex = parsePattern(pattern);
    const paths = {
      foo: false,
      'foo/bar': true,
      'foo/bar/baz': true,
      'bar/foo': false,
      'bar/baz': false,
      'bar/foo/baz': true,
      'bar/foo/baz/qux': true,
    };

    Object.entries(paths).forEach(([path, expected]) => {
      const result = regex.test(path);
      expect(result).toBe(expected);
    });
  });

  it('single-segment pattern with leading and trailing slash', () => {
    const pattern = '/foo/';
    const regex = parsePattern(pattern);
    const paths = {
      foo: false,
      'foo/bar': true,
      'foo/bar/baz': true,
      'bar/foo': false,
      'bar/baz': false,
      'bar/foo/baz': false,
      'bar/foo/baz/qux': false,
    };

    Object.entries(paths).forEach(([path, expected]) => {
      const result = regex.test(path);
      expect(result).toBe(expected);
    });
  });

  it('multi-segment (implicitly left-anchored) pattern', () => {
    const pattern = 'foo/bar';
    const regex = parsePattern(pattern);
    const paths = {
      'foo/bar': true,
      'foo/bart': false,
      'foo/bar/baz': true,
      'baz/foo/bar': false,
      'baz/foo/bar/qux': false,
    };

    Object.entries(paths).forEach(([path, expected]) => {
      const result = regex.test(path);
      expect(result).toBe(expected);
    });
  });

  it('multi-segment pattern with leading slash', () => {
    const pattern = '/foo/bar';
    const regex = parsePattern(pattern);
    const paths = {
      'foo/bar': true,
      'foo/bart': false,
      'foo/bar/baz': true,
      'baz/foo/bar': false,
      'baz/foo/bar/qux': false,
    };

    Object.entries(paths).forEach(([path, expected]) => {
      const result = regex.test(path);
      expect(result).toBe(expected);
    });
  });

  it('multi-segment pattern with trailing slash', () => {
    const pattern = 'foo/bar/';
    const regex = parsePattern(pattern);
    const paths = {
      'foo/bar': false,
      'foo/bart': false,
      'foo/bar/baz': true,
      'baz/foo/bar': false,
      'baz/foo/bar/qux': false,
    };

    Object.entries(paths).forEach(([path, expected]) => {
      const result = regex.test(path);
      expect(result).toBe(expected);
    });
  });

  it('multi-segment pattern with leading and trailing slash', () => {
    const pattern = '/foo/bar/';
    const regex = parsePattern(pattern);
    const paths = {
      'foo/bar': false,
      'foo/bart': false,
      'foo/bar/baz': true,
      'foo/bar/baz/qux': true,
      'baz/foo/bar': false,
      'baz/foo/bar/qux': false,
    };

    Object.entries(paths).forEach(([path, expected]) => {
      const result = regex.test(path);
      expect(result).toBe(expected);
    });
  });

  it('single segment lone wildcard', () => {
    const pattern = '*';
    const regex = parsePattern(pattern);
    const paths = {
      foo: true,
      'foo/bar': true,
      'bar/foo': true,
      'bar/foo/baz': true,
      'bar/baz': true,
      xfoo: true,
    };

    Object.entries(paths).forEach(([path, expected]) => {
      const result = regex.test(path);
      expect(result).toBe(expected);
    });
  });

  it('single segment pattern with wildcard', () => {
    const pattern = 'f*';
    const regex = parsePattern(pattern);
    const paths = {
      foo: true,
      'foo/bar': true,
      'foo/bar/baz': true,
      'bar/foo': true,
      'bar/foo/baz': true,
      'bar/baz': false,
      xfoo: false,
    };

    Object.entries(paths).forEach(([path, expected]) => {
      const result = regex.test(path);
      expect(result).toBe(expected);
    });
  });

  it('single segment pattern with leading slash and lone wildcard', () => {
    const pattern = '/*';
    const regex = parsePattern(pattern);
    const paths = {
      foo: true,
      bar: true,
      'foo/bar': false,
      'foo/bar/baz': false,
    };

    Object.entries(paths).forEach(([path, expected]) => {
      const result = regex.test(path);
      expect(result).toBe(expected);
    });
  });

  it('single segment pattern with leading slash and wildcard', () => {
    const pattern = '/f*';
    const regex = parsePattern(pattern);
    const paths = {
      foo: true,
      'foo/bar': true,
      'foo/bar/baz': true,
      'bar/foo': false,
      'bar/foo/baz': false,
      'bar/baz': false,
      xfoo: false,
    };

    Object.entries(paths).forEach(([path, expected]) => {
      const result = regex.test(path);
      expect(result).toBe(expected);
    });
  });

  it('single segment pattern with trailing slash and wildcard', () => {
    const pattern = 'f*/';
    const regex = parsePattern(pattern);
    const paths = {
      foo: false,
      'foo/bar': true,
      'bar/foo': false,
      'bar/foo/baz': true,
      'bar/baz': false,
      xfoo: false,
    };

    Object.entries(paths).forEach(([path, expected]) => {
      const result = regex.test(path);
      expect(result).toBe(expected);
    });
  });

  it('single segment pattern with leading and trailing slash and lone wildcard', () => {
    const pattern = '/*/';
    const regex = parsePattern(pattern);
    const paths = {
      foo: false,
      'foo/bar': true,
      'bar/foo': true,
      'bar/foo/baz': true,
    };

    Object.entries(paths).forEach(([path, expected]) => {
      const result = regex.test(path);
      expect(result).toBe(expected);
    });
  });

  it('single segment pattern with leading and trailing slash and wildcard', () => {
    const pattern = '/f*/';
    const regex = parsePattern(pattern);
    const paths = {
      foo: false,
      'foo/bar': true,
      'bar/foo': false,
      'bar/foo/baz': false,
      'bar/baz': false,
      xfoo: false,
    };

    Object.entries(paths).forEach(([path, expected]) => {
      const result = regex.test(path);
      expect(result).toBe(expected);
    });
  });

  it('single segment pattern with escaped wildcard', () => {
    const pattern = 'f\\*o';
    const regex = parsePattern(pattern);
    const paths = {
      foo: false,
      'f*o': true,
    };

    Object.entries(paths).forEach(([path, expected]) => {
      const result = regex.test(path);
      expect(result).toBe(expected);
    });
  });

  it('pattern with trailing wildcard segment', () => {
    const pattern = 'foo/*';
    const regex = parsePattern(pattern);
    const paths = {
      foo: false,
      'foo/bar': true,
      'foo/bar/baz': false,
      'bar/foo': false,
      'bar/foo/baz': false,
      'bar/baz': false,
      xfoo: false,
    };

    Object.entries(paths).forEach(([path, expected]) => {
      const result = regex.test(path);
      expect(result).toBe(expected);
    });
  });

  it('multi-segment pattern with wildcard', () => {
    const pattern = 'foo/*.txt';
    const regex = parsePattern(pattern);
    const paths = {
      foo: false,
      'foo/bar.txt': true,
      'foo/bar/baz.txt': false,
      'qux/foo/bar.txt': false,
      'qux/foo/bar/baz.txt': false,
    };

    Object.entries(paths).forEach(([path, expected]) => {
      const result = regex.test(path);
      expect(result).toBe(expected);
    });
  });

  it('multi-segment pattern with lone wildcard', () => {
    const pattern = 'foo/*/baz';
    const regex = parsePattern(pattern);
    const paths = {
      foo: false,
      'foo/bar': false,
      'foo/baz': false,
      'foo/bar/baz': true,
      'foo/bar/baz/qux': true,
    };

    Object.entries(paths).forEach(([path, expected]) => {
      const result = regex.test(path);
      expect(result).toBe(expected);
    });
  });

  it('single segment pattern with single-character wildcard', () => {
    const pattern = 'f?o';
    const regex = parsePattern(pattern);
    const paths = {
      foo: true,
      fo: false,
      fooo: false,
    };

    Object.entries(paths).forEach(([path, expected]) => {
      const result = regex.test(path);
      expect(result).toBe(expected);
    });
  });

  it('single segment pattern with escaped single-character wildcard', () => {
    const pattern = 'f\\?o';
    const regex = parsePattern(pattern);
    const paths = {
      foo: false,
      'f?o': true,
    };

    Object.entries(paths).forEach(([path, expected]) => {
      const result = regex.test(path);
      expect(result).toBe(expected);
    });
  });

  it('leading double-asterisk wildcard', () => {
    const pattern = '**/foo/bar';
    const regex = parsePattern(pattern);
    const paths = {
      'foo/bar': true,
      'qux/foo/bar': true,
      'qux/foo/bar/baz': true,
      'foo/baz/bar': false,
      'qux/foo/baz/bar': false,
    };

    Object.entries(paths).forEach(([path, expected]) => {
      const result = regex.test(path);
      expect(result).toBe(expected);
    });
  });

  it('leading double-asterisk wildcard with regular wildcard', () => {
    const pattern = '**/*bar*';
    const regex = parsePattern(pattern);
    const paths = {
      bar: true,
      'foo/bar': true,
      'foo/rebar': true,
      'foo/barrio': true,
      'foo/qux/bar': true,
    };

    Object.entries(paths).forEach(([path, expected]) => {
      const result = regex.test(path);
      expect(result).toBe(expected);
    });
  });

  it('trailing double-asterisk wildcard', () => {
    const pattern = 'foo/bar/**';
    const regex = parsePattern(pattern);
    const paths = {
      'foo/bar': false,
      'foo/bar/baz': true,
      'foo/bar/baz/qux': true,
      'qux/foo/bar': false,
      'qux/foo/bar/baz': false,
    };

    Object.entries(paths).forEach(([path, expected]) => {
      const result = regex.test(path);
      expect(result).toBe(expected);
    });
  });

  it('middle double-asterisk wildcard', () => {
    const pattern = 'foo/**/bar';
    const regex = parsePattern(pattern);
    const paths = {
      'foo/bar': true,
      'foo/bar/baz': true,
      'foo/qux/bar/baz': true,
      'foo/qux/quux/bar/baz': true,
      'foo/bar/baz/qux': true,
      'qux/foo/bar': false,
      'qux/foo/bar/baz': false,
    };

    Object.entries(paths).forEach(([path, expected]) => {
      const result = regex.test(path);
      expect(result).toBe(expected);
    });
  });

  it('middle double-asterisk wildcard with trailing slash', () => {
    const pattern = 'foo/**/';
    const regex = parsePattern(pattern);
    const paths = {
      foo: false,
      'foo/bar': true,
      'foo/bar/': true,
      'foo/bar/baz': true,
    };

    Object.entries(paths).forEach(([path, expected]) => {
      const result = regex.test(path);
      expect(result).toBe(expected);
    });
  });

  it('middle double-asterisk wildcard with trailing wildcard', () => {
    const pattern = 'foo/**/bar/b*';
    const regex = parsePattern(pattern);
    const paths = {
      'foo/bar': false,
      'foo/bar/baz': true,
      'foo/bar/qux': false,
      'foo/qux/bar': false,
      'foo/qux/bar/baz': true,
      'foo/qux/bar/qux': false,
    };

    Object.entries(paths).forEach(([path, expected]) => {
      const result = regex.test(path);
      expect(result).toBe(expected);
    });
  });
});
