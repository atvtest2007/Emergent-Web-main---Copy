# Releasing a new Maxx Player desktop build

The GitHub Actions workflow at `.github/workflows/desktop.yml` automatically
builds Windows, macOS, and Linux desktop apps and publishes them to a GitHub
Release whenever you push a tag matching `v*`.

## One-time setup

1. Push the repository to GitHub.
2. In the repository settings → **Actions → General**, ensure
   *"Read and write permissions"* is enabled (so the workflow can attach files
   to the Release it creates).
3. (Optional, for code-signed installers — recommended for production)
   - Windows: add `WIN_CSC_LINK` + `WIN_CSC_KEY_PASSWORD` secrets
   - macOS: add `CSC_LINK` + `CSC_KEY_PASSWORD` + Apple notarization secrets
   - Then remove `CSC_IDENTITY_AUTO_DISCOVERY: "false"` from the workflow.

## Cutting a release

```bash
# from repo root
git tag v1.0.1
git push origin v1.0.1
```

The workflow will:

1. Build `frontend/` with `yarn build` on all 3 OS runners.
2. Build the Electron app with electron-builder on each runner:
   - Windows → `Maxx Player-Setup-<version>-x64.exe` + `Maxx Player-Portable-<version>.exe`
   - macOS   → `Maxx Player-<version>-x64.dmg`, `arm64.dmg`, and `.zip`
   - Linux   → `Maxx Player-<version>-x64.AppImage` + `.deb`
3. Upload each runner's outputs as workflow artifacts (retained 14 days).
4. Aggregate everything onto a single GitHub Release named "Maxx Player vX.Y.Z"
   with `SHA256SUMS.txt`.

## Manual run (no tag)

Go to **Actions → Build Desktop Apps → Run workflow** to test the matrix build
without publishing a release. Artifacts are downloadable from the run page.

## Bumping the version

Update the version in two places before tagging:

```bash
# frontend
(cd frontend && yarn version --new-version 1.0.1 --no-git-tag-version)

# desktop wrapper
(cd desktop && yarn version --new-version 1.0.1 --no-git-tag-version)

git add frontend/package.json desktop/package.json
git commit -m "chore: bump to v1.0.1"
git tag v1.0.1
git push && git push --tags
```
