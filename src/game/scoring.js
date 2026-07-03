export function scoreRound(game) {
  const dutchCardsByOwner = new Map();

  for (const pile of game.centerPiles) {
    for (const card of pile.cards) {
      dutchCardsByOwner.set(card.ownerId, (dutchCardsByOwner.get(card.ownerId) ?? 0) + 1);
    }
  }

  return game.players.map((player) => {
    const dutchPoints = dutchCardsByOwner.get(player.id) ?? 0;
    const blitzPenalty = player.piles.blitzPile.length * -2;
    const roundScore = dutchPoints + blitzPenalty;

    return {
      playerId: player.id,
      displayName: player.displayName,
      dutchPoints,
      blitzPenalty,
      roundScore,
      totalScore: player.score + roundScore,
    };
  });
}

export function applyRoundScores(game) {
  const scores = scoreRound(game);

  return {
    ...game,
    players: game.players.map((player) => {
      const score = scores.find((entry) => entry.playerId === player.id);

      return {
        ...player,
        score: score.totalScore,
      };
    }),
    roundScores: scores,
  };
}

