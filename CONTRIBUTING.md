# Contributing

Thanks for your interest. Issues and pull requests are welcome.

## Setup

```bash
bun install
bun run dev
```

## Guidelines

- Keep calculation logic in `src/lib/tdee.ts`, pure and covered by tests in `src/lib/tdee.test.ts`.
- Use design tokens from `src/styles.css`; don't hardcode colours in components.
- New inputs must be keyboard-operable and respect `prefers-reduced-motion`.
- Run `bunx vitest run` and `bun run lint` before opening a PR.
- Use conventional commit messages (`feat:`, `fix:`, `docs:` …).
