This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Product

- A mobile trivia game.
- All user-facing UI is in **Hebrew**. Code, identifiers, file names, comments and commit messages stay in English.
- The app is **RTL-first**. Design and verify every screen for right-to-left layout; prefer logical style properties (`start`/`end`, `marginStart`, `paddingEnd`, …) over `left`/`right`.
- Hebrew copy should read naturally, as a native speaker would write it — not as a literal translation from English.
- A trivia question has **exactly four answers** and **exactly one correct answer**.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Technology

- Expo, React Native, TypeScript, Expo Router.
- Prefer official Expo / React Native solutions and existing, maintained libraries over custom implementations. Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies.
- Use `npx expo install <package>` for dependencies so versions match the installed SDK. Add `-- --dev` for dev dependencies and confirm they landed in `devDependencies`.

## Commands

This project uses npm (`package-lock.json`).

```bash
npm run typecheck           # regenerates Expo Router typed routes, then tsc --noEmit (don't run bare tsc)
npm run lint                # eslint . (eslint-config-expo, flat config)
npm test                    # jest (jest-expo preset)
npm run test:watch          # jest --watch
npx expo start              # start the dev server
npx expo install <package>  # ALWAYS use instead of npm install <package> — resolves SDK-compatible versions
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

## Project structure

Keep it simple; create a folder only when the first file needs it.

```
src/
  app/         # Expo Router routes only: screens and _layout.tsx files
  components/  # reusable UI components
  hooks/       # custom React hooks
  data/        # static content, e.g. the Hebrew question bank
  types/       # shared TypeScript types (e.g. Question)
  utils/       # pure helper functions (shuffling, scoring, …)
__tests__/     # Jest tests, named <subject>-test.ts(x)
assets/        # images and icons referenced by app.json or code
```

Import from `src/` with the `@/` alias (e.g. `@/components/answer-button`).

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Testing

- Features must add or update relevant tests.
- Bug fixes should include a regression test when practical.
- Use Jest + `jest-expo` + React Native Testing Library (`@testing-library/react-native`). Do not use `react-test-renderer`.
- Do not weaken, delete or skip tests merely to make them pass.

Before considering implementation complete, run all required checks. All must pass:

```bash
npm run typecheck
npm run lint
npm test
```

## Git workflow

The user describes the task; the agent handles the Git workflow below without being asked. Do not wait for explicit instructions to create branches, commit, push or open pull requests.

General rules:

- Never implement task changes directly on `main` unless the user explicitly requests an exception.
- Branch names: `feature/<short-name>`, `fix/<short-name>`, `chore/<short-name>` or `refactor/<short-name>`, chosen by the kind of work.
- Keep commits focused. Never mix unrelated changes into a commit.
- Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:` …
- Preserve the existing Git identity. Never modify `git user.name` or `user.email` and never pass `--author`.
- Do not add AI attribution (such as `Co-Authored-By` trailers) to commits or pull requests.
- Never force-push unless explicitly requested.

### Task start

When the user asks for a new feature, fix, chore or refactor:

1. Inspect `git status` and the current branch before editing.
2. If the working tree is not clean, do not discard or overwrite existing work. Resolve it or ask the user before continuing.
3. If on a branch that clearly belongs to the requested task, keep using it.
4. If on `main`, pull the latest `origin/main`, then create and switch to a new task branch with the appropriate prefix.
5. If on an unrelated branch, ask the user before switching.

### Task completion

When the implementation is done:

1. Add or update relevant tests.
2. Run all required checks: `npm run typecheck`, `npm run lint`, `npm test`.
3. Review the full branch diff against `main` for bugs, regressions, unnecessary complexity and missing tests.
4. Fix relevant findings and rerun the checks.
5. Create focused Conventional Commit(s).
6. Push the task branch to `origin`.
7. Open a pull request into `main` using the available GitHub integration or CLI (prefer `gh` when available), with a concise summary and a validation section listing the checks run.
8. Stop and wait. Merging into `main` requires explicit user approval.

### After approved merge

Only after the user explicitly approves the merge:

1. Squash-merge the pull request, unless the user explicitly requests another merge strategy.
2. `git checkout main`
3. Pull the latest `origin/main`.
4. Verify the merged work is present.
5. Delete the local task branch.
6. Delete the remote task branch if it still exists.
7. `git fetch --prune`
8. Verify the working tree is clean.

Never delete a branch before verifying that its work has been merged.

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `npx eas-cli@latest <command>`; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
