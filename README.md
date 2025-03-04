# Affected Code Owners

GitHub Action to determine which `CODEOWNERS` are affected based on changes in a pull request."

This action parses the `CODEOWNERS` file in your repository and generates:

- A list of **individual code owners** whose ownership paths match the files changed in the pull request.
- A list of **grouped code owners**, where each group corresponds to a set of rules that match specific files.

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
