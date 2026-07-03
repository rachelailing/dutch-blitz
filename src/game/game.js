import { DEFAULT_TARGET_SCORE } from "./constants.js";
import { dealRoundPlayers } from "./deal.js";
import { applyRoundScores } from "./scoring.js";

function createPlayer(input, index) {
  return {
    id: input.id,
    displayName: input.displayName ?? `Player ${index + 1}`,
    seat: index,
    status: "active",
    score: input.score ?? 0,
    piles: null,
  };
}

export function createGame(players, options = {}) {
  if (players.length < 2 || players.length > 4) {
    throw new Error("Dutch Blitz supports 2-4 players.");
  }

  const createdAt = options.createdAt ?? Date.now();
  const seatedPlayers = players.map(createPlayer);

  return {
    id: options.id ?? `game-${createdAt}`,
    status: "playing",
    players: dealRoundPlayers(seatedPlayers, options),
    centerPiles: [],
    startedAt: createdAt,
    endedAt: null,
    roundNumber: options.roundNumber ?? 1,
    hostPlayerId: options.hostPlayerId ?? seatedPlayers[0].id,
    blitzCallerId: null,
    targetScore: options.targetScore ?? DEFAULT_TARGET_SCORE,
    roundScores: [],
  };
}

export function finishRound(game) {
  const scoredGame = applyRoundScores(game);
  const winner = scoredGame.players.find((player) => player.score >= scoredGame.targetScore);

  return {
    ...scoredGame,
    status: winner ? "game-ended" : "round-scored",
    winnerPlayerId: winner?.id ?? null,
  };
}

export function createNextRound(previousGame, options = {}) {
  const players = previousGame.players.map((player) => ({
    id: player.id,
    displayName: player.displayName,
    score: player.score,
  }));

  return createGame(players, {
    ...options,
    roundNumber: previousGame.roundNumber + 1,
    hostPlayerId: previousGame.hostPlayerId,
    targetScore: previousGame.targetScore,
  });
}

