# Changelog

All notable A Wizard's Picnic changes, reconstructed from the Git history starting with the first commit.

This document broadly follows [Keep a Changelog](https://keepachangelog.com/). Dates and versions prefixed with `v` come from Git tags. The 2018 canvas game had no version tags; it is recorded here as 1.0.0 so the 2026 rewrite can be 2.0.0.

## [Unreleased]

## [2.0.0] – 2026-09-03

A from-scratch rewrite of the 2018 React picnic into a typed SvenJS 3 app.

### Breaking changes

- Replaced the Webpack + React 0.14 `bundle.js` runtime with SvenJS 3.2.1, Vite, and TypeScript. The old string-refs / `keyCode` loop is gone.

### Added

- Stamp UI: `create()` screens for title, game, HUD, touch pad, mute, and the SvenJS credit mark used the same way as the Rantjs demo.
- A fixed-timestep canvas sim (world, input, AI, collision, waves) kept off `setState`.
- Eight picnic-themed enemies with distinct AI (swarm, dash, lunge, fly-by, charge, thief, ranged, split) plus the original DCSS roster with roles.
- Twin-stick controls (WASD move, arrows shoot, Space/click fire), pause, restart, high score, spawn grace, and i-frames.
- Comic Web Audio: a looping picnic waltz and stingers for shoot, hit, kill, hurt, wave, pause, win, and lose. Mute persists.
- Touch controls on coarse / narrow viewports.
- Vitest coverage for collision, wave tables, catalog scaling, spawn grace, and bolt hits.

### Changed

- Cooldown is a 3 px hairline on the HUD. The old canvas ring and dual Spell bar are gone.
- Classic tiles are edge-keyed so black tile backgrounds do not sit as squares on the grass.
- Title copy and instructions are HTML over a text-free picnic illustration.

### Security

- Rewrote Git history so the 2018 author email is the GitHub noreply address, and stripped `.DS_Store` from `assets.zip`.

## [1.0.0] – 2018-07-12

The original picnic. Recorded from the first (and then only) commit; there was no tag at the time.

### Added

- A 512×512 canvas game bundled as `bundle.js`.
- Title screen, WASD movement, arrow-key bolts, and fourteen single-type waves of DCSS beasts.
- Player skins, beast tiles, boards, and the original title painting.
