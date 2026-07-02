# Dutch Blitz Discord Activity PRD

## 1. Overview

Dutch Blitz is a real-time multiplayer card game experience built as a Discord Embedded Activity. Players should be able to launch the activity from a Discord voice channel, join a shared game room, play a fast-paced Dutch Blitz-inspired game with friends, and see round results without leaving Discord.

The current project is a Vite app with Discord Embedded App SDK readiness handling. This PRD defines the intended product direction and MVP requirements for turning the shell into a playable Discord activity.

## 2. Goals

- Create a playable multiplayer Dutch Blitz-style card game inside Discord.
- Support quick room setup for friends already gathered in a voice channel.
- Provide clear, responsive gameplay for desktop users in the Discord client.
- Keep rules understandable for new players while preserving the speed and tension of the original game.
- Build a foundation that can later support matchmaking, persistence, cosmetics, and additional game variants.

## 3. Non-Goals

- Recreating the physical Dutch Blitz game brand, artwork, or copyrighted assets exactly.
- Supporting public matchmaking in the MVP.
- Supporting ranked play, accounts, long-term progression, or monetization in the MVP.
- Building a standalone non-Discord multiplayer product in the MVP.
- Supporting mobile-first gameplay in the MVP, unless Discord activity constraints require basic responsive behavior.

## 4. Target Users

### Primary Users

Friend groups who use Discord voice channels and want a fast casual game they can play together during a call.

### Secondary Users

Discord community members who want lightweight party-game activities that are easy to teach and quick to restart.

## 5. User Problems

- Players want a game that starts quickly without sharing links, creating accounts, or installing extra software.
- Players need real-time feedback because Dutch Blitz-style gameplay is fast and simultaneous.
- New players need enough guidance to understand piles, valid moves, and round objectives.
- Groups need clear turn-independent game state so disputes are minimized.

## 6. MVP Scope

### Included

- Discord Embedded Activity launch and readiness flow.
- Lobby screen showing connected players.
- Host-controlled game start.
- 2-4 player game support.
- Basic Dutch Blitz-style gameplay:
  - Each player has a personal blitz pile.
  - Each player has post piles and a draw/wood pile.
  - Shared center piles are built upward by color/suit.
  - Players race to empty their blitz pile.
- Real-time synchronization of shared and player-specific game state.
- Move validation on the authoritative game state.
- Round end detection and scoring.
- Rematch flow.
- Basic rules/help view.
- Clear handling for disconnects, reconnects, and activity close.

### Excluded From MVP

- AI/bot players.
- Spectator mode.
- Chat or voice features beyond Discord itself.
- Advanced animations or custom card art.
- Saved player profiles.
- Ranked leaderboard.

## 7. Gameplay Requirements

### Card Sets

- The game uses four decks of Dutch Blitz cards.
- Each deck contains 40 cards, for a total of 160 cards across the full game.
- Each player receives one of the four distinct decks, which feature different symbols and colors.
- Players use only their assigned deck throughout the game.

### Lobby

- Users can see who has joined the activity.
- The host can start the game when 2-4 players are present.
- The UI prevents game start with fewer than 2 players.
- Late joiners after a round starts are placed into a waiting state until the next round.

### Game Setup

- Each player receives a unique card set distinguished by symbol/color or player identity.
- Initial piles are dealt consistently from a shuffled deck per player.
- Each player places 3 cards face-up in a row to form their Post piles.
- Each player deals 9 cards face-down, topped with 1 face-up card, to form their Blitz pile.
- If the total value of the face-up cards in a player's Post and Blitz piles exceeds 30, that player reshuffles and redeals their initial piles.
- The remaining cards become that player's Wood pile, which they cycle through during gameplay.
- The game state includes:
  - Player list.
  - Player pile state.
  - Shared center piles.
  - Round timer or elapsed time.
  - Current score state.

### Core Play

- There are no turns; all players play simultaneously.
- Players race to play cards onto shared Dutch piles or their own Post stacks as quickly as possible.
- The main objective of each round is to be the first player to empty their Blitz pile.

### Player Actions

- Players can move valid cards from their available piles to shared center piles.
- Players can move cards among their own piles according to game rules.
- Players can cycle through their draw/wood pile.
- Invalid moves are rejected and visually communicated.
- Actions should feel immediate, with server reconciliation if authoritative multiplayer state is introduced.

### Dutch Piles

- Dutch piles are central, shared piles available to all players.
- Dutch piles are built in ascending sequence starting with rank 1 cards when available.
- Any player can add to a Dutch pile if the card is next in numerical order for that pile.
- When a Dutch pile reaches rank 10, it is placed face-down and closed.

### Wood Pile

- Players flip through their Wood pile in sets of 3 cards at a time.
- Each flip reveals a face-up card on top of the currently available Wood cards.
- If the top Wood card cannot be played, the player continues cycling through the Wood pile until a playable card is found or the cycle continues.
- This mechanism should feel similar to the draw pile flow in Solitaire.

### Blitz Pile

- The Blitz pile is the key round-ending pile.
- Playing all cards from the Blitz pile ends the round.
- Each time a player plays a card from a Post pile, the player moves the face-up card from their Blitz pile into that Post pile slot and reveals the next Blitz card.
- When a player runs out of cards in their Blitz pile, they call "Blitz" to signal the end of the round.

### Advanced Play: Post Pile Stacking

- Players can rearrange cards within their Post piles by stacking cards in descending order.
- Post pile stacks must alternate between "boy" and "girl" card colors.
- Red and blue cards are treated as boy cards.
- Yellow and green cards are treated as girl cards.
- Players may move cards from their Blitz pile or between Post piles this way to free up cards and reveal new playable cards.

### Round End

- A round ends when a player empties their blitz pile.
- The winning player is clearly announced after they call "Blitz."
- Scores are calculated and shown for all players.
- Players can start another round from the results screen.

### Scoring

- Once a player empties their Blitz pile and calls "Blitz," scoring begins.
- Each remaining card in a player's Blitz pile counts as -2 points.
- Players earn 1 point for each card they contributed to the shared Dutch piles, categorized by symbol.
- The first player to reach a total of 75 points wins the overall game.
- The game may also support configurable targets or a fixed number of rounds.

## 8. Discord Activity Requirements

- Use `VITE_DISCORD_CLIENT_ID` for SDK initialization.
- Show a clear local-development fallback when the Discord SDK is unavailable.
- Call Discord SDK readiness before requiring Discord-specific context.
- Handle embedded activity constraints, including viewport size and focus behavior.
- Avoid blocking the game if Discord metadata is temporarily unavailable.

## 9. UX Requirements

- First screen should be the lobby or local development status, not a marketing page.
- Game board must prioritize speed and scannability.
- Cards should have stable dimensions and not shift layout during play.
- Valid moves should be visually discoverable.
- Invalid moves should provide quick, non-disruptive feedback.
- The game should be playable with mouse input for MVP.
- UI text should be concise and action-oriented.
- The game should remain legible at common Discord desktop activity sizes.

## 10. Technical Requirements

- Frontend framework: Vite with browser-native JavaScript or a lightweight framework if introduced later.
- Discord integration: `@discord/embedded-app-sdk`.
- Build command: `npm run build`.
- Local development command: `npm run dev`.
- Game logic should be separated from rendering so it can be tested independently.
- Move validation should be deterministic and covered by unit tests.
- Shared multiplayer state should have a single authoritative source.
- Environment variables should not be committed with secrets.

## 11. Suggested Architecture

- `discord.js`: Discord SDK bootstrapping and app initialization.
- `src/game/`: Core game rules, deck creation, shuffle, move validation, scoring.
- `src/state/`: Client state management and multiplayer synchronization.
- `src/ui/`: Rendering and interaction components.
- `src/styles/`: Game board and responsive layout styling.
- `src/tests/`: Unit tests for rule logic and scoring.

This structure is a recommendation. It should be adjusted if the project adopts a specific frontend framework or multiplayer backend.

## 12. Data Model

### Player

- `id`
- `displayName`
- `seat`
- `status`
- `score`
- `piles`

### Card

- `id`
- `rank`
- `color`
- `symbol`
- `deckId`
- `ownerId`
- `location`
- `faceUp`

### Game

- `id`
- `status`
- `players`
- `centerPiles`
- `startedAt`
- `endedAt`
- `roundNumber`
- `hostPlayerId`

### Move

- `playerId`
- `cardId`
- `from`
- `to`
- `createdAt`

## 13. Success Metrics

- A new group can start a round in under 30 seconds after launching the activity.
- At least 95% of attempted valid moves are reflected in the UI within 150 ms locally.
- Players can complete a full 2-player round without refreshing or restarting.
- Rule validation tests cover deck setup, legal moves, illegal moves, round end, and scoring.
- Build succeeds consistently with `npm run build`.

## 14. Milestones

### Milestone 1: Playable Local Prototype

- Implement deck generation, pile setup, move validation, and scoring.
- Render a local single-browser game board.
- Support manual round reset.

### Milestone 2: Discord Lobby

- Use Discord SDK context to identify activity users.
- Add lobby and host start flow.
- Preserve local development fallback.

### Milestone 3: Multiplayer Round

- Add real-time game state synchronization.
- Support 2-4 players.
- Handle disconnect and reconnect behavior.

### Milestone 4: MVP Polish

- Add rules/help view.
- Improve visual feedback and layout.
- Add tests for critical gameplay logic.
- Verify production build.

## 15. Open Questions

- What multiplayer backend will provide authoritative game state?
- Should the game follow Dutch Blitz rules closely, or use a simplified variant for faster onboarding?
- Should each player have private information, or can all piles be visible for simplicity?
- Will custom card artwork be created, or should MVP use simple CSS-rendered cards?
