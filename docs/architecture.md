# Architecture Overview

Kairo uses a small extension architecture with clear separation between capture, storage, and presentation.

## Runtime Layers

- `content/` detects the active platform, extracts conversation turns, and injects capture controls.
- `background/service-worker.js` validates capsules, stores data, handles enrichment, and responds to messages.
- `popup/` provides a searchable capsule browser and injection actions.
- `options/` exposes settings for enrichment and capture-button visibility.
- `shared/` contains the capsule model, storage helpers, message constants, and utility functions.

## Data Flow

1. The content script detects a supported AI chat page.
2. The extractor reads visible conversation data from the page.
3. The content script builds a capsule object and sends it to the service worker.
4. The service worker validates the capsule, optionally enriches it, and saves it to storage.
5. The popup and options pages read from the same storage layer to display and manage capsules.

## Storage Rules

- Capsules are stored in `chrome.storage.local`.
- Settings are stored in `chrome.storage.sync` when possible.
- Save operations use a read-modify-write flow so the stored capsule list stays consistent.

## Extension Principles

- Keep capture logic platform-specific and local to extractors.
- Keep storage logic in the shared storage module.
- Keep user-facing text concise and plain.
- Prefer graceful fallback behavior when extraction fails.
