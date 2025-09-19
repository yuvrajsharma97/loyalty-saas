const calculateVisitPoints = (store, spend = 0) => {
  const { rewardConfig } = store;
  let points = 0;

  switch (rewardConfig.type) {
    case "visit":
      points = rewardConfig.pointsPerVisit;
      break;
    case "spend":
      points = Math.floor(spend * rewardConfig.pointsPerPound);
      break;
    case "hybrid":
      points =
        rewardConfig.pointsPerVisit +
        Math.floor(spend * rewardConfig.pointsPerPound);
      break;
    default:
      points = 0;
  }

  return Math.max(0, points);
};

const checkAutoRedemption = (points, conversionRate) => {
  return Math.floor(points / conversionRate);
};

module.exports = { calculateVisitPoints, checkAutoRedemption };
