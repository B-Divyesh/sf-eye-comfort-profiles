# Demo sandbox

- URL: `https://eye-comfort-profiles.sociobot.in/?demo=1#controls`
- Entry action: **Try it with sample data** on the first screen.
- Sample: 24 px text, 1.80 line spacing, 52-character lines, and the Night
  slate reading surface applied to the product's real interactive preview.
- Reset: **Reset demo** restores all four sample values.
- Exit: **Leave demo** returns to the normal landing page and download.
- Isolation: the preview is DOM-only. Demo mode skips license storage and
  verification and does not read or write localStorage, IndexedDB, cookies,
  extension storage, or real profile data. Reloading or leaving the URL
  discards every demo change, so no storage namespace is needed.
