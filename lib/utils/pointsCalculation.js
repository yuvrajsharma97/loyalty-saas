export function calculatePoints(visit, storeConfig) {
  const { type, pointsPerPound, pointsPerVisit } = storeConfig.rewardConfig;

  switch (type) {
    case "visit":
      return pointsPerVisit;
    case "spend":
      return Math.floor(visit.spend * pointsPerPound);
    case "hybrid":
      return Math.floor(visit.spend * pointsPerPound) + pointsPerVisit;
    default:
      return 0;
  }
}

export function calculateTierFromUserCount(userCount) {
  if (userCount <= 100) return "silver";
  if (userCount <= 500) return "gold";
  return "platinum";
}