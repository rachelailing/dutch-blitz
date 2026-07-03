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

## 15. Product Workflow

### Primary Happy Path

1. A Discord user launches the activity from a voice channel.
2. The app initializes the Discord SDK and calls readiness.
3. If Discord context is available, the user enters the shared lobby.
4. If Discord context is unavailable in local development, the user sees a local fallback lobby.
5. Players join the lobby and are shown with display names, seats, and readiness/status.
6. The host can start once 2-4 active players are present.
7. The game deals a round:
   - Assign each player a unique deck identity.
   - Shuffle each player deck.
   - Deal Post, Blitz, and Wood piles.
   - Redeal a player's starting piles if their visible starting total exceeds 30.
8. The game board appears for all active players.
9. Players simultaneously make moves:
   - Play available cards to shared Dutch piles.
   - Stack or rearrange their own Post piles.
   - Cycle through Wood cards.
   - Refill Post pile slots from the Blitz pile where required.
10. The authoritative game state validates each move.
11. Valid moves update the board immediately.
12. Invalid moves are rejected with quick visual feedback.
13. A round ends when a player empties their Blitz pile and calls "Blitz."
14. The results screen shows the round winner, per-player scoring, and updated totals.
15. If no player has reached the game target, the host can start a rematch round.
16. If a player reaches the target score, the game shows the overall winner and offers a new game.

### Screen Flow

- `Boot`: Load app shell, initialize Discord SDK, and determine environment.
- `Local Fallback`: Show local development controls when Discord context is unavailable.
- `Lobby`: Show joined players, host controls, and start eligibility.
- `Waiting`: Show late joiners that a round is in progress and they will join next round.
- `Round Setup`: Assign decks, shuffle, deal, and prepare synchronized state.
- `Game Board`: Render active piles, center Dutch piles, scores, elapsed time, and controls.
- `Rules Help`: Display concise rules without leaving the current room.
- `Round Results`: Show Blitz caller, card counts, score changes, and rematch action.
- `Game Results`: Show overall winner once the score target is reached.
- `Disconnected`: Show reconnecting state and recover if the session becomes available again.

### Lobby Workflow

- User enters the activity.
- App creates or joins the current room for the Discord activity instance.
- First connected eligible player becomes host unless Discord ownership metadata provides a better host source.
- Host sees an enabled start control only when 2-4 players are ready.
- Non-host players see waiting status and current host.
- Late joiners during active rounds are assigned `waiting` status.
- Waiting players become eligible at the next lobby or rematch state.

### Gameplay Workflow

- Player selects or drags a visible card.
- UI highlights valid target piles where possible.
- Player drops or clicks a target pile.
- Client submits a move intent with player, card, source, target, and timestamp.
- Authoritative state checks card ownership, visibility, current location, pile rules, and round status.
- Accepted moves update the shared game state and all clients reconcile to that state.
- Rejected moves restore the local visual state and show non-blocking feedback.
- The round monitor checks after each accepted move whether any Blitz pile is empty.

### Scoring Workflow

- Round enters scoring immediately after a valid Blitz condition.
- Game counts each player's cards contributed to Dutch piles.
- Game subtracts 2 points for each card remaining in that player's Blitz pile.
- Round score deltas are added to total scores.
- If any player has at least 75 points, the game enters overall results.
- Otherwise, the game enters round results and waits for the host to start the next round.

### Disconnect And Reconnect Workflow

- If a player disconnects in the lobby, remove or mark them inactive after a short grace period.
- If a player disconnects during a round, keep their seat and pile state temporarily reserved.
- Reconnected players reclaim their previous seat by Discord user ID.
- If the host disconnects, assign host to the next active player.
- If active player count drops below 2 during a round, pause or end the round based on the multiplayer backend capability.
- If the activity closes for all players, clean up the room state.

### Error And Edge States

- Discord SDK unavailable: show local fallback mode.
- Missing client ID: show setup guidance and prevent Discord-only startup.
- Multiplayer service unavailable: keep the lobby visible and show retry status.
- Desynchronized client state: request a fresh authoritative snapshot.
- Illegal move race: reject the slower conflicting move and reconcile the affected client.

## 16. Open Questions

- What multiplayer backend will provide authoritative game state?
- Should the game follow Dutch Blitz rules closely, or use a simplified variant for faster onboarding?
- Should each player have private information, or can all piles be visible for simplicity?
- Will custom card artwork be created, or should MVP use simple CSS-rendered cards?
