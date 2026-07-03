import { cloneCard } from "./cards.js";

function cloneGame(game) {
  return {
    ...game,
    players: game.players.map((player) => ({
      ...player,
      piles: {
        blitzPile: [...player.piles.blitzPile],
        postPiles: player.piles.postPiles.map((pile) => [...pile]),
        woodPile: [...player.piles.woodPile],
        woodWaste: [...player.piles.woodWaste],
      },
    })),
    centerPiles: game.centerPiles.map((pile) => ({
      ...pile,
      cards: [...pile.cards],
    })),
  };
}

function findPlayer(game, playerId) {
  return game.players.find((player) => player.id === playerId);
}

function topOf(pile) {
  return pile[pile.length - 1] ?? null;
}

function getPile(player, location) {
  if (location.zone === "blitz") return player.piles.blitzPile;
  if (location.zone === "woodWaste") return player.piles.woodWaste;
  if (location.zone === "post") return player.piles.postPiles[location.index];
  return null;
}

function cardMatchesLocation(card, location) {
  if (!card) return false;
  if (location.cardId && card.id !== location.cardId) return false;
  return card.location.zone === location.zone;
}

function canStackOnPost(card, targetPile) {
  const targetTop = topOf(targetPile);

  if (!targetTop) {
    return true;
  }

  return card.rank === targetTop.rank - 1 && card.colorGroup !== targetTop.colorGroup;
}

function canPlayOnDutchPile(card, centerPile) {
  if (!centerPile || centerPile.closed) {
    return false;
  }

  const targetTop = topOf(centerPile.cards);

  if (!targetTop) {
    return card.rank === 1;
  }

  return card.color === centerPile.color && card.rank === targetTop.rank + 1;
}

function availableCardForMove(player, from) {
  const pile = getPile(player, from);
  const card = topOf(pile ?? []);

  if (!cardMatchesLocation(card, from) || !card.faceUp) {
    return null;
  }

  return card;
}

function validateCardMove(game, move) {
  const player = findPlayer(game, move.playerId);

  if (!player) {
    return { ok: false, reason: "Player not found." };
  }

  if (game.status !== "playing") {
    return { ok: false, reason: "Round is not active." };
  }

  const card = availableCardForMove(player, move.from);

  if (!card) {
    return { ok: false, reason: "Only the top face-up card can move." };
  }

  if (card.ownerId !== player.id) {
    return { ok: false, reason: "Player cannot move another player's card." };
  }

  if (move.to.zone === "dutch") {
    const centerPile = move.to.pileId
      ? game.centerPiles.find((pile) => pile.id === move.to.pileId)
      : { cards: [], color: card.color, closed: false };

    if (!canPlayOnDutchPile(card, centerPile)) {
      return { ok: false, reason: "Card cannot be played on that Dutch pile." };
    }

    return { ok: true };
  }

  if (move.to.zone === "post") {
    if (move.to.playerId !== player.id) {
      return { ok: false, reason: "Players can only stack on their own Post piles." };
    }

    if (move.from.zone === "post" && move.from.index === move.to.index) {
      return { ok: false, reason: "Source and target Post piles are the same." };
    }

    const targetPile = player.piles.postPiles[move.to.index];

    if (!targetPile || !canStackOnPost(card, targetPile)) {
      return { ok: false, reason: "Post piles stack descending with alternating groups." };
    }

    return { ok: true };
  }

  return { ok: false, reason: "Unsupported target pile." };
}

function revealBlitzTop(player) {
  const topCard = topOf(player.piles.blitzPile);

  if (!topCard || topCard.faceUp) {
    return;
  }

  player.piles.blitzPile[player.piles.blitzPile.length - 1] = cloneCard(topCard, {
    faceUp: true,
  });
}

function refillEmptyPostFromBlitz(player, postIndex) {
  const postPile = player.piles.postPiles[postIndex];

  if (postPile.length > 0 || player.piles.blitzPile.length === 0) {
    return;
  }

  const card = player.piles.blitzPile.pop();
  postPile.push(
    cloneCard(card, {
      faceUp: true,
      location: { zone: "post", playerId: player.id, index: postIndex },
    }),
  );
  revealBlitzTop(player);
}

function drawFromSource(player, from) {
  const sourcePile = getPile(player, from);
  const card = sourcePile.pop();

  if (from.zone === "blitz") {
    revealBlitzTop(player);
  }

  return card;
}

function applyCardMove(game, move) {
  const nextGame = cloneGame(game);
  const player = findPlayer(nextGame, move.playerId);
  const card = drawFromSource(player, move.from);
  const movedCard = cloneCard(card, {
    location: move.to,
    faceUp: true,
  });

  if (move.to.zone === "dutch") {
    let centerPile = move.to.pileId
      ? nextGame.centerPiles.find((pile) => pile.id === move.to.pileId)
      : null;

    if (!centerPile) {
      centerPile = {
        id: `dutch-${nextGame.centerPiles.length + 1}`,
        color: movedCard.color,
        closed: false,
        cards: [],
      };
      nextGame.centerPiles.push(centerPile);
    }

    centerPile.cards.push(
      cloneCard(movedCard, {
        location: { zone: "dutch", pileId: centerPile.id },
      }),
    );

    if (movedCard.rank === 10) {
      centerPile.closed = true;
    }
  }

  if (move.to.zone === "post") {
    player.piles.postPiles[move.to.index].push(movedCard);
  }

  if (move.from.zone === "post") {
    refillEmptyPostFromBlitz(player, move.from.index);
  }

  if (player.piles.blitzPile.length === 0) {
    nextGame.status = "round-ended";
    nextGame.endedAt = move.createdAt ?? Date.now();
    nextGame.blitzCallerId = player.id;
  }

  return nextGame;
}

function applyCycleWood(game, move) {
  const nextGame = cloneGame(game);
  const player = findPlayer(nextGame, move.playerId);

  if (!player) {
    return nextGame;
  }

  if (player.piles.woodPile.length === 0) {
    player.piles.woodPile = player.piles.woodWaste.reverse().map((card) =>
      cloneCard(card, {
        faceUp: false,
        location: { zone: "wood", playerId: player.id },
      }),
    );
    player.piles.woodWaste = [];
  }

  const drawCount = Math.min(3, player.piles.woodPile.length);

  for (let index = 0; index < drawCount; index += 1) {
    const card = player.piles.woodPile.pop();
    player.piles.woodWaste.push(
      cloneCard(card, {
        faceUp: true,
        location: { zone: "woodWaste", playerId: player.id },
      }),
    );
  }

  return nextGame;
}

export function validateMove(game, move) {
  if (move.type === "cycle-wood") {
    const player = findPlayer(game, move.playerId);

    if (!player) {
      return { ok: false, reason: "Player not found." };
    }

    if (game.status !== "playing") {
      return { ok: false, reason: "Round is not active." };
    }

    return { ok: true };
  }

  if (move.type === "play-card") {
    return validateCardMove(game, move);
  }

  return { ok: false, reason: "Unsupported move type." };
}

export function applyMove(game, move) {
  const validation = validateMove(game, move);

  if (!validation.ok) {
    return {
      game,
      accepted: false,
      reason: validation.reason,
    };
  }

  const nextGame =
    move.type === "cycle-wood" ? applyCycleWood(game, move) : applyCardMove(game, move);

  return {
    game: nextGame,
    accepted: true,
    reason: null,
  };
}

