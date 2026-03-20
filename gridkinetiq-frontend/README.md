# GridKinetiq Frontend

React + Vite frontend for the GridKinetiq fleet management dashboard.

## Development

```bash
npm install
npm run dev
```

## Versioning

This project uses **[semantic-release](https://semantic-release.gitbook.io/)** with **Conventional Commits**. Every push to `main` automatically determines the version bump based on your commit message prefix.

### Commit message format

```
<type>: <short description>
```

| Prefix | Version bump | Example |
|---|---|---|
| `feat:` | minor `1.X.0` | `feat: add battery status chart` |
| `fix:` | patch `1.0.X` | `fix: correct voltage calculation` |
| `chore:`, `docs:`, `style:`, `refactor:`, `test:` | none | `chore: update dependencies` |
| `feat!:` or `BREAKING CHANGE:` in body | major `X.0.0` | see below |

### Forcing a major bump

Add `BREAKING CHANGE:` to the commit body:

```
feat: redesign fleet API

BREAKING CHANGE: removed /devices endpoint, use /fleet instead
```

Or use the shorthand `!` after the type:

```
feat!: redesign fleet API
```

### First-time setup

When setting up on a new repo, create an initial git tag so semantic-release has a baseline:

```bash
git tag v1.0.0
git push origin v1.0.0
```

### How it works

On every push to `main` the GitHub Actions workflow:
1. Runs `semantic-release` — analyzes commits since the last tag, bumps `package.json`, commits back with `[skip ci]`, and creates a GitHub Release with a changelog
2. Builds the app — the new version is baked in at build time via `__APP_VERSION__` and shown in the sidebar
3. Deploys to S3

The version displayed in the app (bottom-left of the sidebar) always reflects the version that was current at build time.
