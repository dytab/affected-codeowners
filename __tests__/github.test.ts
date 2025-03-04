import { jest } from '@jest/globals';
import * as github from '@actions/github';
jest.mock('@actions/github');

import { GitHubService } from '../src/github-service.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { GitHub } from '@actions/github/lib/utils';
import { RequestError } from '@octokit/request-error';

describe('GitHubService', () => {
  let context: typeof github.context;
  beforeAll(() => {
    context = {
      eventName: 'pull_request',
      repo: { repo: 'example-repo', owner: 'example-owner' },
      payload: { pull_request: { number: 1234, base: { ref: 'main' } } },
    } as unknown as typeof github.context;
  });
  beforeEach(() => {
    jest.resetModules();
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('listChangedFiles', () => {
    it('should return a list of changed file names for the pull request', async () => {
      const mockIterator = jest.fn(async function* () {
        // page1
        yield { data: [{ filename: 'file1.js' }] };
        // page2
        yield { data: [{ filename: 'file2.js' }, { filename: 'file3.js' }] };
      });

      const response = {
        paginate: {
          iterator: mockIterator,
        },
        rest: {
          pulls: {
            listFiles: jest.fn(),
          },
        },
      };

      jest
        .mocked(github.getOctokit)
        .mockReturnValue(response as unknown as InstanceType<typeof GitHub>);

      const gitHubService = new GitHubService('fakegithubtoken', context);

      const output = await gitHubService.listChangedFiles();

      expect(output).toEqual(['file1.js', 'file2.js', 'file3.js']);
    });
  });

  describe('getCodeownersFile', () => {
    it('should return the content and location of the CODEOWNERS file if found', async () => {
      const response = {
        rest: {
          repos: {
            getContent: async () => {
              return {
                data: {
                  name: 'CODEOWNERS',
                  path: '.github/CODEOWNERS',
                  type: 'file',
                  content: Buffer.from(
                    'test-codeowners-content',
                    'utf-8'
                  ).toString('base64'),
                },
              };
            },
          },
        },
      };
      jest
        .mocked(github.getOctokit)
        .mockReturnValue(response as unknown as InstanceType<typeof GitHub>);
      const gitHubService = new GitHubService('fakegithubtoken', context);

      const output = await gitHubService.getCodeownersFile();

      expect(output).toEqual({
        content: 'test-codeowners-content',
        location: '.github/CODEOWNERS',
      });
    });

    it('should find the correct location of the CODEOWNERS file and return its content', async () => {
      const response = {
        rest: {
          repos: {
            getContent: jest
              .fn()
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              .mockRejectedValueOnce({
                status: 404,
                message: 'Not Found',
              } as RequestError)
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              .mockResolvedValueOnce({
                data: {
                  name: 'CODEOWNERS',
                  path: 'CODEOWNERS',
                  type: 'file',
                  content: Buffer.from(
                    'test-codeowners-content',
                    'utf-8'
                  ).toString('base64'),
                },
              }),
          },
        },
      };

      jest
        .mocked(github.getOctokit)
        .mockReturnValueOnce(
          response as unknown as InstanceType<typeof GitHub>
        );
      const gitHubService = new GitHubService('fakegithubtoken', context);

      const output = await gitHubService.getCodeownersFile();

      expect(output).toEqual({
        content: 'test-codeowners-content',
        location: 'CODEOWNERS',
      });
    });
  });

  describe('getCodeownersErrors', () => {
    it('should return error lines and location if errors exist', async () => {
      const response = {
        rest: {
          repos: {
            codeownersErrors: async () => {
              return {
                data: {
                  errors: [
                    { line: 5, path: '.github/CODEOWNERS' },
                    { line: 8, path: '.github/CODEOWNERS' },
                  ],
                },
              };
            },
          },
        },
      };

      jest
        .mocked(github.getOctokit)
        .mockReturnValue(response as unknown as InstanceType<typeof GitHub>);
      const gitHubService = new GitHubService('fakegithubtoken', context);

      const output = await gitHubService.getCodeownersErrors();

      expect(output).toEqual({
        lines: [5, 8],
        location: '.github/CODEOWNERS',
      });
    });

    it('should return empty lines and undefined location if no errors exist', async () => {
      const response = {
        rest: {
          repos: {
            codeownersErrors: async () => {
              return {
                data: {
                  errors: [],
                },
              };
            },
          },
        },
      };

      jest
        .mocked(github.getOctokit)
        .mockReturnValue(response as unknown as InstanceType<typeof GitHub>);
      const gitHubService = new GitHubService('fakegithubtoken', context);

      const output = await gitHubService.getCodeownersErrors();

      expect(output).toEqual({
        lines: [],
        location: null,
      });
    });
  });
});
