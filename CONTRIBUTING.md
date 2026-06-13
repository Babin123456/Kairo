# Contributing to Kairo

Thanks for taking the time to contribute.

## Before You Start

- Read the README and architecture overview first.
- Prefer small, focused changes.
- Do not edit generated `dist-chrome/` or `dist-firefox/` files directly; change the source files and rebuild instead.

## Local Setup

```bash
npm install
npm run dev
```

For Firefox builds, use `npm run dev:firefox` or `npm run build:firefox`.

## Code Style

- Keep modules small and readable.
- Use clear, descriptive names.
- Preserve the current message and storage boundaries between `content/`, `background/`, and `shared/`.
- Add comments only when they explain non-obvious behavior.
- Keep user-facing text plain and professional.

## Testing

Before opening a pull request, run at least:

```bash
npm run build
```

If you touch Firefox-specific code, also run:

```bash
npm run build:firefox
```

## Pull Request Checklist

- Explain what changed and why.
- Include screenshots or short recordings for UI changes when possible.
- Mention any manual verification steps.
- Keep the diff focused on one topic.

## Issue Reports

When filing an issue, include:

- Browser and version
- Extension target platform
- Steps to reproduce
- Expected behavior
- Actual behavior
