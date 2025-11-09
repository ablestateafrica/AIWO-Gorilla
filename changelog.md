# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2025-11-09

-   Fix: Ensure chat wrapper and input area remain visible on mobile and desktop.
    -   Updated `styles.css` to make the chat content the scrollable area and the input
        bar sticky to the bottom of the viewport (keyboard-safe using `env(safe-area-inset-bottom, 0)`).
    -   Changes include reserving header space (`.main` padding-top), making `#chatWrapper`
        flexible inside the layout, enabling `#chat` to overflow/scroll with smooth iOS
        momentum and bottom padding so the last message isn't hidden by the input.
    -   Added `-webkit-backdrop-filter` fallback and reordered appearance vendor prefixes
        for broader browser compatibility.
