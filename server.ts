import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Email Trigger API
  // In a real scenario, this would be a Cloud Function or a dedicated service.
  app.post('/api/trigger-email', (req, res) => {
    const { type, bookingData, userEmail } = req.body;
    console.log(`[EMAIL TRIGGER] Type: ${type}, Recipient: ${userEmail}`);
    console.log(`[EMAIL CONTENT] Data:`, bookingData);
    
    // Simulate legacy SendGrid integration
    res.json({ 
      success: true, 
      message: `Email of type ${type} triggered for ${userEmail}`,
      reference: Math.random().toString(36).substring(7).toUpperCase()
    });
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`>>> Quick Fix Auto Server Running on http://localhost:${PORT}`);
    console.log(`>>> Mode: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
