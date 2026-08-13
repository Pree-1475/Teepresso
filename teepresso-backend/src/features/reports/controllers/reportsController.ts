import { Request, Response } from 'express';
import { monthlySalesDatabase, getBusinessAnalytics } from '../models/reportsModel.js';

export const getReportsController = (_req: Request, res: Response): void => {
  res.json({
    success: true,
    reports: monthlySalesDatabase,
  });
};

export const getAnalyticsController = (_req: Request, res: Response): void => {
  res.json({
    success: true,
    analytics: getBusinessAnalytics(),
  });
};
