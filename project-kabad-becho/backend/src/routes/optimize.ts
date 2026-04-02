import { Router, Request, Response } from 'express';
import { OptimizationRequest, OptimizationResponse } from '../models/types';
import { CvrpEngine } from '../services/cvrpService';

export const optimizeRouter = Router();

optimizeRouter.post('/', async (req: Request, res: Response) => {
  try {
    const payload: OptimizationRequest = req.body;

    const engine = new CvrpEngine(payload);
    const optimizedRoutes = await engine.optimize();

    const response: OptimizationResponse = {
      status: 'success',
      data: optimizedRoutes,
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Optimization error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal Routing Engine Error'
    });
  }
});
