# Affected Code Owners

[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

GitHub Action to determine which `CODEOWNERS` are affected based on changes in a pull request.

This action parses the `CODEOWNERS` file in your repository and generates:

- A list of **individual code owners** whose ownership paths match the files changed in the pull request.
- A list of **grouped code owners**, where each group corresponds to a set of rules that match specific files.

### Known Limitations and GitHub Inconsistencies

While this action aims to closely follow GitHub's [documented syntax and conventions](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners) for `CODEOWNERS` files, there are a few caveats to note:

- **Escaping patterns starting with `#`**: According to GitHub's documentation, escaping a pattern starting with `#` using `\` does not work (it is always treated as a comment). However, in practice, GitHub may handle these cases inconsistently.

- **Negating patterns using `!`**: Similarly, negating patterns with `!` is documented as unsupported, but certain cases appear to work unexpectedly in actual usage.

This action adheres to the rules as outlined in GitHub's documentation, but discrepancies in GitHub's own implementation may lead to subtle differences when using `CODEOWNERS` files directly on their platform.

---

## Usage

### Example Workflow

You can use the action in your GitHub workflow as follows:

```yaml
name: 'Check Affected Code Owners'

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  affected-codeowners:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: read

    steps:
      - name: Check out repository
        uses: actions/checkout@v3

      - name: List affected code owners
        uses: dytab/affected-codeowners@v1
        id: affected-codeowners

      - name: Output affected code owners
        run: |
          echo "Individual Owners: ${{ steps.affected-codeowners.outputs.individual-owners }}"
          echo "Grouped Owners: ${{ steps.affected-codeowners.outputs.grouped-owners }}"
```

## Outputs

The action generates the following outputs:

| Name                | Description                                                                                                                               | Example                                            |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `individual-owners` | A JSON-formatted string containing a deduplicated list of all affected code owners for the changed files.                                 | `["@owner1", "@owner3", "@owner2"]`                |
| `grouped-owners`    | A JSON-formatted string containing a list of owner groups, where each group corresponds to a set of rules that matched the changed files. | `[["@owner1", "@owner3"], ["@owner2", "@owner3"]]` |

---

## Prerequisites

1. **A `CODEOWNERS` file:**
   The file should be in the `.github/` directory of your repository. Example:

   ```txt
   # Example CODEOWNERS file
   /src/* @team-a
   /docs/* @team-b
   ```

---

### Example Scenario

Assume the files changed in a PR are:

- `/src/file.js`
- `/src/utils/helper.js`
- `/docs/guide.md`
- `/docs/setup/config.md`
- `/tests/unit/test.spec.js`
- `/package.json`

With the following `CODEOWNERS` file:

```txt
# CODEOWNERS rules
/**/*.js @team-global
/src/* @team-a @user1
/src/utils/* @team-c @user2 @user3
/docs/* @team-b @user1
/tests/unit/* @team-a @user2
/package.json @team-maintainers @user3
```

The action will produce the following outputs:

- **Individual Owners**  
   All affected code owners, deduplicated:

  ```json
  [
    "@team-a",
    "@user1",
    "@team-c",
    "@user2",
    "@user3",
    "@team-b",
    "@team-maintainers"
  ]
  ```

- **Grouped Owners**  
  Code owners grouped by the rules that matched the files:
  ```json
  [
    ["@team-a", "@user1"],
    ["@team-c", "@user2", "@user3"],
    ["@team-b", "@user1"],
    ["@team-a", "@user2"],
    ["@team-maintainers", "@user3"]
  ]
  ```

## Acknowledgements

This action uses logic inspired by the CLI and Go library [`hmarr/codeowners`](https://github.com/hmarr/codeowners) to parse the `CODEOWNERS` file .  
Kudos to their excellent work on parsing and handling `CODEOWNERS` files.

# Development

## Publishing a New Release

This project includes a helper script, [`script/release`](./script/release)
designed to streamline the process of tagging and pushing new releases for
GitHub Actions.

GitHub Actions allows users to select a specific version of the action to use,
based on release tags. This script simplifies this process by performing the
following steps:

1. **Retrieving the latest release tag:** The script starts by fetching the most
   recent SemVer release tag of the current branch, by looking at the local data
   available in your repository.
1. **Prompting for a new release tag:** The user is then prompted to enter a new
   release tag. To assist with this, the script displays the tag retrieved in
   the previous step, and validates the format of the inputted tag (vX.X.X). The
   user is also reminded to update the version field in package.json.
1. **Tagging the new release:** The script then tags a new release and syncs the
   separate major tag (e.g. v1, v2) with the new release tag (e.g. v1.0.0,
   v2.1.2). When the user is creating a new major release, the script
   auto-detects this and creates a `releases/v#` branch for the previous major
   version.
1. **Pushing changes to remote:** Finally, the script pushes the necessary
   commits, tags and branches to the remote repository. From here, you will need
   to create a new release in GitHub so users can easily reference the new tags
   in their workflows.
