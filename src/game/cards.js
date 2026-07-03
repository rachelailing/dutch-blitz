import { CARD_COLORS, COLOR_GROUPS, DECK_SYMBOLS, RANKS } from "./constants.js";

export function createPlayerDeck(playerId, deckId) {
  const symbol = DECK_SYMBOLS[deckId % DECK_SYMBOLS.length];

  return CARD_COLORS.flatMap((color) =>
    RANKS.map((rank) => ({
      id: `${playerId}-${symbol}-${color}-${rank}`,
      rank,
      color,
      colorGroup: COLOR_GROUPS[color],
      symbol,
      deckId,
      ownerId: playerId,
      location: null,
      faceUp: false,
    })),
  );
}

export function createDecksForPlayers(players) {
  return players.map((player, index) => createPlayerDeck(player.id, index));
}

export function cloneCard(card, updates = {}) {
  return {
    ...card,
    ...updates,
  };
}

