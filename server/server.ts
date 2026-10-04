import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

import { authRouter } from './routes/auth.routes';
import { dashboardRouter } from './routes/dashboard.routes';
import { productsRouter } from './routes/products.routes';
import { operationsRouter } from './routes/operations.routes';
import { stockRouter } from './routes/stock.routes';
import { authMiddleware } from './middleware/authMiddleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

// Public Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'StockSense Cloud API',
    version: '1.0.0'
  });
});

// 1. Authentication Routes (Public: login, register, refresh)
app.use('/api/auth', authRouter);

// 2. Protected Business Routes (Require valid JWT)
app.use('/api/dashboard', authMiddleware, dashboardRouter);
app.use('/api/products', authMiddleware, productsRouter);
app.use('/api/operations', authMiddleware, operationsRouter);
app.use('/api/stock', authMiddleware, stockRouter);

// 3. API Catch-all (Unmatched /api/* routes return JSON 404, not HTML)
app.all('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// 4. Centralized Global Error Handler (4-argument signature)
app.use((err: any, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('[StockSense Global Error Handler]:', err);
  const status = typeof err.status === 'number' ? err.status : (typeof err.statusCode === 'number' ? err.statusCode : 500);
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    error: message,
    ...(err.details ? { details: err.details } : {})
  });
});

// 5. Static / Vite Dev Server Integration
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const distPath = path.resolve(__dirname, '../dist');

  if (!isProduction) {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
        appType: 'spa'
      });
      app.use(vite.middlewares);
      console.log('⚡ Vite dev server mounted in middleware mode');
    } catch (viteError) {
      console.warn('Could not initialize Vite middleware mode, falling back to static files:', viteError);
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 StockSense Backend & Frontend running on http://0.0.0.0:${PORT}`);
    console.log(`🔒 Auth endpoints: /api/auth/*`);
    console.log(`📦 Protected APIs: /api/dashboard, /api/products, /api/operations, /api/stock`);
  });
}

// Only launch listener if this module is run directly
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
