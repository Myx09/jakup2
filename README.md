# Orbit Arcade — Phase 1

A dependency-free, browser-based game hub foundation built with HTML5, CSS3, vanilla JavaScript, and Canvas 2D.

## Phase 1 scope

This build includes:

- Responsive main hub interface with working Overview, Character, My Profile, and Settings navigation.
- A new local player profile with a unique player ID and **1,000 fictional virtual credits**.
- Automatic LocalStorage persistence for the player name, balance, character appearance, statistics, and settings.
- Character customization (Runner, Ranger, and Pixel styles; outfit, skin, hair, and accent colors) with an animated Canvas 2D preview.
- Profile details, editable display name, and a local-data warning.
- Settings for sound preference, reduced motion, and screen-shake preference.
- A reset option that starts a new local profile with 1,000 credits.

The Lobby, casino games, arcade games, WebRTC connections, and multiplayer wagering are **not implemented in Phase 1**. The interface labels these as future phases; it does not simulate those features.

## Project structure

```text
game-hub-phase1/
├── index.html
├── css/
│   └── main.css
├── js/
│   ├── account.js
│   ├── character.js
│   ├── navigation.js
│   ├── storage.js
│   └── ui.js
└── README.md
```

## Run locally

1. Extract the project folder.
2. Open `index.html` in a modern browser.
3. JavaScript modules are loaded from relative paths. Most current browsers allow this app to run from a local static file; when a browser blocks ES modules on `file://`, use any static file preview or local static server. No package installation or backend is needed.

## Publish with GitHub Pages

1. Create a GitHub repository and upload the contents of this folder to the repository root (so `index.html` is at the root).
2. Open **Settings → Pages** in the repository.
3. Select **Deploy from a branch**, choose your publishing branch (usually `main`) and the `/ (root)` folder, then save.
4. Open the Pages URL after deployment.

All local CSS and JavaScript references are relative, so the site works from a GitHub Pages project subpath as well as a domain root.

## LocalStorage account limitations

The profile is saved in the browser's LocalStorage on the current device and browser origin. It is **not a secure global account system**. It does not authenticate a person, synchronize profiles between browsers or devices, or protect balances and statistics from editing by the device owner. Clearing site data can erase the profile. A truly shared and tamper-resistant account or economy would require a trusted backend, which is outside this serverless project's constraints.

The default credit balance and any future game balances are fictional and have no cash value.

## Phase 1 test checklist

- [ ] Open Overview and confirm the starting balance is 1,000.
- [ ] Open Character, change the name, style, and each color group; confirm the preview updates.
- [ ] Refresh the page and confirm the selected name and appearance remain saved.
- [ ] Open My Profile and confirm the player ID, creation date, and balance are displayed.
- [ ] Change the name on the profile page and confirm it also updates in the header and sidebar.
- [ ] Toggle each setting, refresh, and confirm the values remain selected.
- [ ] Reset the character and confirm the default appearance returns.
- [ ] Reset the profile (confirmation required) and confirm a new player ID and 1,000 starting credits.
- [ ] Resize the browser to a narrow mobile width and check the layout.

## Browser compatibility

Designed for modern browsers with ES modules, Canvas 2D, LocalStorage, and standard DOM APIs. Clipboard copy may require HTTPS or localhost; if clipboard access is unavailable, the player ID is shown in a toast instead.
