import "./src/styles/debug-board.css";
import { applyMove, createGame, createNextRound, finishRound } from "./src/game/index.js";

const app = document.querySelector("#app");

const localPlayers = [
  { id: "player-1", displayName: "Player 1" },
  { id: "player-2", displayName: "Player 2" },
];

let game = createGame(localPlayers);
let selected = null;
let feedback = "Select a top card, then choose a Dutch or Post pile target.";
let discordStatus = "Loaded locally.";

function cardLabel(card) {
  if (!card) return "";
  return `${card.rank} ${card.color}`;
}

function sourceFromCard(card) {
  if (!card) return null;

  if (card.location.zone === "post") {
    return {
      zone: "post",
      playerId: card.location.playerId,
      index: card.location.index,
      cardId: card.id,
    };
  }

  return {
    zone: card.location.zone,
    playerId: card.location.playerId,
    cardId: card.id,
  };
}

function isSelected(card) {
  return selected?.from.cardId === card?.id;
}

function topCard(pile) {
  return pile[pile.length - 1] ?? null;
}

function renderCard(card, source) {
  if (!card) {
    return `<div class="card empty">Empty</div>`;
  }

  const disabled = !source ? "disabled" : "";
  const pressed = isSelected(card) ? "true" : "false";

  return `
    <button
      class="card card-${card.color} ${isSelected(card) ? "selected" : ""}"
      type="button"
      data-action="select-card"
      data-player-id="${source?.playerId ?? ""}"
      data-zone="${source?.zone ?? ""}"
      data-index="${source?.index ?? ""}"
      data-card-id="${card.id}"
      aria-pressed="${pressed}"
      ${disabled}
    >
      <span class="rank">${card.rank}</span>
      <span class="color">${card.color}</span>
      <span class="symbol">${card.symbol}</span>
    </button>
  `;
}

function renderStackPreview(pile) {
  const hiddenCount = pile.filter((card) => !card.faceUp).length;
  const top = topCard(pile);

  if (!top) {
    return `<span class="pile-count">0 cards</span>`;
  }

  return `
    <span class="pile-count">${pile.length} cards</span>
    ${hiddenCount > 0 ? `<span class="pile-count">${hiddenCount} hidden</span>` : ""}
  `;
}

function renderDutchPiles() {
  const openPileButtons = game.centerPiles
    .map((pile) => {
      const top = topCard(pile.cards);

      return `
        <button
          class="target-pile dutch-pile ${pile.closed ? "closed" : ""}"
          type="button"
          data-action="target-dutch"
          data-pile-id="${pile.id}"
          ${pile.closed ? "disabled" : ""}
        >
          <span>${pile.color}</span>
          <strong>${top ? top.rank : "Open"}</strong>
          <small>${pile.cards.length} cards</small>
        </button>
      `;
    })
    .join("");

  return `
    <section class="center-area" aria-label="Dutch piles">
      <div class="section-heading">
        <h2>Dutch Piles</h2>
        <span>${game.centerPiles.length} started</span>
      </div>
      <div class="dutch-grid">
        <button class="target-pile start-pile" type="button" data-action="target-new-dutch">
          <span>New pile</span>
          <strong>1</strong>
          <small>Start with any 1</small>
        </button>
        ${openPileButtons}
      </div>
    </section>
  `;
}

function renderPlayer(player) {
  const blitzTop = topCard(player.piles.blitzPile);
  const woodWasteTop = topCard(player.piles.woodWaste);

  return `
    <section class="player-board">
      <div class="player-heading">
        <h2>${player.displayName}</h2>
        <span>${player.symbol} deck</span>
      </div>

      <div class="pile-row">
        <div class="pile-panel">
          <div class="pile-title">
            <h3>Blitz</h3>
            ${renderStackPreview(player.piles.blitzPile)}
          </div>
          ${renderCard(blitzTop, sourceFromCard(blitzTop))}
        </div>

        <div class="pile-panel">
          <div class="pile-title">
            <h3>Wood</h3>
            <span class="pile-count">${player.piles.woodPile.length} draw</span>
            <span class="pile-count">${player.piles.woodWaste.length} waste</span>
          </div>
          <button class="control-button" type="button" data-action="cycle-wood" data-player-id="${player.id}">
            Cycle 3
          </button>
          ${renderCard(woodWasteTop, sourceFromCard(woodWasteTop))}
        </div>
      </div>

      <div class="post-grid">
        ${player.piles.postPiles
          .map((pile, index) => {
            const postTop = topCard(pile);

            return `
              <div class="pile-panel">
                <div class="pile-title">
                  <h3>Post ${index + 1}</h3>
                  ${renderStackPreview(pile)}
                </div>
                ${renderCard(postTop, sourceFromCard(postTop))}
                <button
                  class="target-button"
                  type="button"
                  data-action="target-post"
                  data-player-id="${player.id}"
                  data-index="${index}"
                >
                  Move here
                </button>
              </div>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderScores() {
  if (!game.roundScores?.length) {
    return "";
  }

  return `
    <section class="scores">
      <h2>Scores</h2>
      <div class="score-grid">
        ${game.roundScores
          .map(
            (score) => `
              <div class="score-row">
                <strong>${score.displayName}</strong>
                <span>Dutch ${score.dutchPoints}</span>
                <span>Blitz ${score.blitzPenalty}</span>
                <span>Total ${score.totalScore}</span>
              </div>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function render() {
  app.innerHTML = `
    <main class="app-shell">
      <header class="top-bar">
        <div>
          <h1>Dutch Blitz</h1>
          <p id="status">${discordStatus}</p>
        </div>
        <div class="toolbar">
          <button class="control-button" type="button" data-action="score-round" ${
            game.status === "round-ended" ? "" : "disabled"
          }>
            Score Round
          </button>
          <button class="control-button" type="button" data-action="next-round" ${
            game.status === "round-scored" ? "" : "disabled"
          }>
            Next Round
          </button>
          <button class="control-button" type="button" data-action="reset-game">Reset</button>
        </div>
      </header>

      <section class="debug-status">
        <strong>${game.status}</strong>
        <span>${feedback}</span>
      </section>

      ${renderDutchPiles()}

      <div class="players-grid">
        ${game.players.map(renderPlayer).join("")}
      </div>

      ${renderScores()}
    </main>
  `;
}

function selectCard(button) {
  selected = {
    playerId: button.dataset.playerId,
    from: {
      zone: button.dataset.zone,
      playerId: button.dataset.playerId,
      cardId: button.dataset.cardId,
    },
  };

  if (button.dataset.index !== "") {
    selected.from.index = Number(button.dataset.index);
  }

  feedback = `Selected ${button.textContent.trim().replace(/\s+/g, " ")}.`;
  render();
}

function playSelectedCard(to) {
  if (!selected) {
    feedback = "Select a top card first.";
    render();
    return;
  }

  const result = applyMove(game, {
    type: "play-card",
    playerId: selected.playerId,
    from: selected.from,
    to,
    createdAt: Date.now(),
  });

  game = result.game;
  feedback = result.accepted ? "Move accepted." : result.reason;
  selected = null;
  render();
}

function cycleWood(playerId) {
  const result = applyMove(game, {
    type: "cycle-wood",
    playerId,
    createdAt: Date.now(),
  });

  game = result.game;
  feedback = result.accepted ? "Wood pile cycled." : result.reason;
  selected = null;
  render();
}

app.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const { action } = button.dataset;

  if (action === "select-card") {
    selectCard(button);
  }

  if (action === "target-new-dutch") {
    playSelectedCard({ zone: "dutch" });
  }

  if (action === "target-dutch") {
    playSelectedCard({ zone: "dutch", pileId: button.dataset.pileId });
  }

  if (action === "target-post") {
    playSelectedCard({
      zone: "post",
      playerId: button.dataset.playerId,
      index: Number(button.dataset.index),
    });
  }

  if (action === "cycle-wood") {
    cycleWood(button.dataset.playerId);
  }

  if (action === "score-round") {
    game = finishRound(game);
    feedback = "Round scored.";
    selected = null;
    render();
  }

  if (action === "next-round") {
    game = createNextRound(game);
    feedback = "Next round dealt.";
    selected = null;
    render();
  }

  if (action === "reset-game") {
    game = createGame(localPlayers);
    feedback = "New local game dealt.";
    selected = null;
    render();
  }
});

async function setupDiscord() {
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;

  if (!clientId) {
    discordStatus = "Loaded locally. Add VITE_DISCORD_CLIENT_ID to connect the Discord SDK.";
    render();
    return;
  }

  try {
    const { DiscordSDK } = await import("@discord/embedded-app-sdk");
    const discordSdk = new DiscordSDK(clientId);

    await discordSdk.ready();
    discordStatus = "Discord Activity ready.";
    render();
    console.log("Discord Activity ready");
  } catch (error) {
    discordStatus = "Loaded locally. Discord SDK will be ready when opened inside Discord.";
    render();
    console.warn(error);
  }
}

render();
setupDiscord();
