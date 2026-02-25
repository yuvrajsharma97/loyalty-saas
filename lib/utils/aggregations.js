export function getVisitTrendsAggregation(storeId, period, groupBy) {
  const now = new Date();
  let matchDate;

  switch (period) {
    case "7d":
      matchDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      matchDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "90d":
      matchDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case "1y":
      matchDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      matchDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  let dateFormat;
  switch (groupBy) {
    case "day":
      dateFormat = "%Y-%m-%d";
      break;
    case "week":
      dateFormat = "%Y-%U";
      break;
    case "month":
      dateFormat = "%Y-%m";
      break;
    default:
      dateFormat = "%Y-%m-%d";
  }

  return [
  {
    $match: {
      storeId: storeId,
      createdAt: { $gte: matchDate },
      status: "approved"
    }
  },
  {
    $group: {
      _id: {
        date: { $dateToString: { format: dateFormat, date: "$createdAt" } },
        method: "$method"
      },
      count: { $sum: 1 },
      totalSpend: { $sum: "$spend" },
      totalPoints: { $sum: "$points" }
    }
  },
  {
    $group: {
      _id: "$_id.date",
      visits: {
        $push: {
          method: "$_id.method",
          count: "$count",
          totalSpend: "$totalSpend",
          totalPoints: "$totalPoints"
        }
      },
      totalVisits: { $sum: "$count" },
      totalSpend: { $sum: "$totalSpend" },
      totalPoints: { $sum: "$totalPoints" }
    }
  },
  { $sort: { _id: 1 } }];

}