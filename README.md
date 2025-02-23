# affected-codeowners

GitHub Action to determine which code owners are affected based on the changes in a pull request (PR).

This action parses the `CODEOWNERS` file in your repository and generates a list of code owners whose ownership paths match the files changed in the pull request.

---

## Usage

### Example Workflow

You can use the action in your GitHub workflow as follows:

```yaml
name: "Check Affected Code Owners"

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  affected-codeowners:
    runs-on: ubuntu-latest

    steps:
      - name: Check out repository
        uses: actions/checkout@v3

      - name: List affected code owners
        uses: ./actions/affected-codeowners # Path to or repository of the action
        id: affected-codeowners
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Output affected code owners
        run: echo "Affected Code Owners: ${{ steps.affected-codeowners.outputs.codeowners }}"
```


## Outputs

The action generates the following output:

| Name       | Description                                                   |
|------------|---------------------------------------------------------------|
| `codeowners` | A comma-separated list of affected code owners in the PR.   |

---

## Prerequisites

1. **A `CODEOWNERS` file:**
   The file should be in the `.github/` directory of your repository. Example:

   ```txt
   # Example CODEOWNERS file
   /src/* @team-a
   /docs/* @team-b
   ```

2. **GitHub Token:**
   The action uses the `$GITHUB_TOKEN` to fetch pull request changes. It is automatically provided in the GitHub workflow environment.

---

### Example Scenario

Assume the files changed in a PR are:
- `/src/file.js`
- `/docs/guide.md`

With the following `CODEOWNERS` file:

```txt
/src/* @team-a
/docs/* @team-b
/**/*.js @team-c
```

The action will identify the following code owners as affected: