import { connectDB } from '../../../../lib/db';
import Visit from '../../../../models/Visit';
import { requireUser } from '../../../../middleware/auth';
import { analyticsSchema } from '../../../../lib/validations';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  await connectDB();
  
  return requireUser(req, res, async (req, res) => {
    if (req.method === 'GET') {
      try {
        const { period, storeId } = analyticsSchema.parse(req.query);
        
        // Calculate date range based on period
        const now = new Date();
        let startDate;
        let groupFormat;
        let labels = [];
        
        switch (period) {
          case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
            // Generate last 7 days
            for (let i = 6; i >= 0; i--) {
              const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
              labels.push(date.toISOString().split('T')[0]);
            }
            break;
          case '90d':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            groupFormat = { 
              $dateToString: { 
                format: "%Y-%U", 
                date: "$createdAt" 
              } 
            };
            // Generate last 13 weeks
            for (let i = 12; i >= 0; i--) {
              labels.push(`Week ${13 - i}`);
            }
            break;
          case '1y':
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            groupFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
            // Generate last 12 months
            for (let i = 11; i >= 0; i--) {
              const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
              labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
            }
            break;
          default: // 30d
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
            // Generate last 30 days
            for (let i = 29; i >= 0; i--) {
              const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
              labels.push(date.toISOString().split('T')[0]);
            }
        }
        
        // Build aggregation pipeline
        const matchStage = {
          userId: new mongoose.Types.ObjectId(req.user.id),
          status: 'approved',
          createdAt: { $gte: startDate }
        };
        
        if (storeId) {
          matchStage.storeId = new mongoose.Types.ObjectId(storeId);
        }
        
        const pipeline = [
          { $match: matchStage },
          {
            $group: {
              _id: groupFormat,
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ];
        
        const results = await Visit.aggregate(pipeline);
        
        // Create data array matching labels
        const dataMap = {};
        results.forEach(result => {
          if (period === '90d') {
            // For weekly grouping, map week numbers to readable labels
            const weekNum = parseInt(result._id.split('-')[1]);
            const currentWeek = Math.floor((now - startDate) / (7 * 24 * 60 * 60 * 1000));
            const labelIndex = 12 - (currentWeek - weekNum);
            if (labelIndex >= 0 && labelIndex < 13) {
              dataMap[labels[labelIndex]] = result.count;
            }
          } else if (period === '1y') {
            // For monthly grouping
            const [year, month] = result._id.split('-');
            const monthIndex = parseInt(month) - 1;
            const date = new Date(parseInt(year), monthIndex, 1);
            const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
            dataMap[monthLabel] = result.count;
          } else {
            dataMap[result._id] = result.count;
          }
        });
        
        const data = labels.map(label => dataMap[label] || 0);
        
        const totalVisits = data.reduce((sum, count) => sum + count, 0);
        const averagePerPeriod = totalVisits / labels.length;
        
        res.json({
          labels,
          data,
          totalVisits,
          averagePerMonth: period === '1y' ? averagePerPeriod : null,
          averagePerDay: period !== '1y' ? averagePerPeriod : null
        });
      } catch (error) {
        if (error.name === 'ZodError') {
          return res.status(400).json({
            error: 'Invalid query parameters',
            details: error.errors
          });
        }
        console.error('Get visit analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).json({ error: 'Method not allowed' });
    }
  });
}