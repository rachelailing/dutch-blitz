import {
  BLITZ_PILE_SIZE,
  POST_PILE_COUNT,
  STARTING_VISIBLE_TOTAL_LIMIT,
} from "./constants.js";
import { cloneCard, createPlayerDeck } from "./cards.js";
import { shuffleDeck } from "./random.js";

function locate(card, location, faceUp) {
  return cloneCard(card, {
    location,
    faceUp,
  });
}

function visibleStartingTotal(piles) {
  const postTotal = piles.postPiles.reduce((total, pile) => {
    const topCard = pile[pile.length - 1];
    return total + (topCard?.rank ?? 0);
  }, 0);
  const blitzTop = piles.blitzPile[piles.blitzPile.length - 1];

  return postTotal + (blitzTop?.rank ?? 0);
}

export function dealPlayerPiles(player, deck, options = {}) {
  const random = options.random ?? Math.random;
  const maxAttempts = options.maxAttempts ?? 100;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const shuffled = shuffleDeck(deck, random);
    let cursor = 0;

    const postPiles = Array.from({ length: POST_PILE_COUNT }, (_, index) => [
      locate(shuffled[cursor++], { zone: "post", playerId: player.id, index }, true),
    ]);

    const blitzPile = [];
    for (let index = 0; index < BLITZ_PILE_SIZE; index += 1) {
      blitzPile.push(
        locate(
          shuffled[cursor++],
          { zone: "blitz", playerId: player.id },
          index === BLITZ_PILE_SIZE - 1,
        ),
      );
    }

    const woodPile = shuffled
      .slice(cursor)
      .map((card) => locate(card, { zone: "wood", playerId: player.id }, false));

    const piles = {
      blitzPile,
      postPiles,
      woodPile,
      woodWaste: [],
    };

    if (visibleStartingTotal(piles) <= STARTING_VISIBLE_TOTAL_LIMIT) {
      return piles;
    }
  }

  throw new Error("Unable to deal a valid starting layout.");
}

export function dealRoundPlayers(players, options = {}) {
  return players.map((player, index) => {
    const deck = createPlayerDeck(player.id, index);

    return {
      ...player,
      deckId: index,
      symbol: deck[0].symbol,
      status: "active",
      piles: dealPlayerPiles(player, deck, options),
    };
  });
}

