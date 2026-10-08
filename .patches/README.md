# Patches

Changes to files under `.github/workflows/` need the GitHub `workflow`
scope, which the environment that prepared this branch does not have.
CI changes are therefore delivered as patches in this folder.

Apply them from the repository root:

```sh
git am .patches/*.patch
```

| Patch | Adds |
| ----- | ---- |
| `0001-ci-add-build-workflow.patch` | `.github/workflows/build.yml`: `npm install`, `npm run build --if-present` and `npm test` on Node.js 24 and 22, for pushes and pull requests on `master` and `main`. |
