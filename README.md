# A Wizard's Picnic

**You're a wizard. You're on a picnic. They packed teeth.**

A tiny twin-stick lawn defense in the browser. Pack the basket, keep the ants off the cheese, and maybe — *maybe* — you get to eat.

[GitHub](https://github.com/robbestad/awizardspicnic) · UI built with [SvenJS 3.2.1](https://svenjs.xyz/)

```bash
npm install
npm test
npm run dev
```

Open the URL Vite prints. Space or **Pack the basket** starts the game. Click **Sound on** (or press **M**) if the picnic waltz is quiet — browsers block audio until you poke them.

## Why this picnic

- **Twin-stick on a blanket.** WASD moves, arrows shoot, Space or click fires the way you face. It is still a picnic, not a cover shooter.
- **They do not all walk the same.** Ants swarm, wasps dash, mimics lunge, ravens cut across, bears telegraph a charge, goblins steal and bolt, storm sprites snipe, sandwich slimes split. The old DCSS tiles still show up as the classic roster.
- **Fourteen waves, then lunch.** Mixed spawns, a short grace at the start of each wave, i-frames, a high score in `localStorage`, pause, and a win screen that finally lets you sit down.
- **Comic noise.** Web Audio only: a little G-major waltz plus toots for shots, hits, oofs, and disaster. No sample packs.
- **One mental model.** Screens are SvenJS stamps (`create({ initialState, render })`). The 60 fps sim stays off the vDOM. `setState` replaces.

## Controls

| Input | Action |
| --- | --- |
| WASD | Move |
| Arrow keys | Shoot |
| Space / click | Fire facing (or toward the pointer) |
| Esc / P | Pause |
| M | Mute |
| Touch pad | On a phone: stick + Fire |

Survive wave 14. The ants retreat. You can finally enjoy your picnic.

## Stack

SvenJS 3.2.1, Vite, TypeScript, canvas, Web Audio. No React. The 2018 build was a Webpack + React 0.14 `bundle.js`; 2.0 throws that out.

```ts
export const App = create<Record<string, never>, AppState>({
  initialState() {
    return { scene: "title", highScore: readHighScore() };
  },
  render() {
    return this.state.scene === "title"
      ? <TitleScreen onStart={() => this.go("game")} highScore={this.state.highScore} />
      : <GameScreen onExit={() => this.go("title")} onHighScore={(n) => this.setHighScore(n)} />;
  },
});
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite on :5173 |
| `npm test` | Vitest (collision, waves, catalog, combat) |
| `npm run build` | Typecheck + production bundle |
| `npm run preview` | Serve `dist/` |

## License

[ISC](LICENSE). Original tiles from the 2018 picnic. New crashers generated for 2.0.
