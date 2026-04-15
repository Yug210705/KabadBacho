import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { optimizeRouter } from './routes/optimize';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Main Engine API
app.use('/optimize-routes', optimizeRouter);

app.get('/', (req, res) => {
  res.json({
    service: 'KabadBecho Optimization Engine',
    status: 'running',
    endpoints: {
      'POST /optimize-routes': 'Run CVRP route optimization',
      'GET /health': 'Health check',
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', engine: 'Online' });
});

app.listen(PORT, () => {
  console.log(`🚀 Optimization Engine running on http://localhost:${PORT}`);
});
