import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import fetch, { RequestInit, Response as FetchResponse } from 'node-fetch';
import { Stream } from 'stream'; // Import Stream type

const app = express();
const PORT: number = parseInt(process.env.PORT || '3003', 10);

// Add CORS middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Add logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Add detailed error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => { // Explicitly type err as Error
  console.error('Express error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.use(express.json());

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.send('OpenRouter Proxy is running');
});

// Ping endpoint for health checks
app.get('/api/ai-chat/ping', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'OpenRouter Proxy', timestamp: new Date().toISOString() });
});

// Frontend ping endpoint
app.get('/api/chat/ai-chat/ping', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'OpenRouter Proxy', timestamp: new Date().toISOString() });
});

// Define an interface for the expected request body structure
interface ChatRequestBody {
  stream?: boolean;
  // Add other expected properties from req.body here if known
  // e.g., messages: Array<{ role: string; content: string }>;
}

// Frontend chat endpoint - /api/chat/ai-chat
app.post('/api/chat/ai-chat', async (req: Request<{}, {}, ChatRequestBody>, res: Response) => { // Type req.body
  console.log('Frontend chat request received');
  try {
    // Forward the request to our API server
    const apiServerUrl: string = 'http://api-server:3002/api/proxy/ai-chat';
    const { stream } = req.body;

    console.log(`Forwarding to API server: ${apiServerUrl} (stream=${!!stream})`);

    // Explicitly type fetchOptions
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': stream ? 'text/event-stream' : 'application/json'
      },
      // Don't set the timeout here as it could cause early termination
      body: JSON.stringify(req.body)
    };

    // Log the request body for debugging
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const fetchResponse: FetchResponse = await fetch(apiServerUrl, fetchOptions);

    if (!fetchResponse.ok) {
      console.error(`API server error: ${fetchResponse.status} ${fetchResponse.statusText}`);
      const errorText: string = await fetchResponse.text();
      console.error('Error response body:', errorText);
      throw new Error(`API server error: ${fetchResponse.status} - ${errorText || fetchResponse.statusText}`);
    }

    // Handle streaming responses
    if (stream) {
      console.log('Setting up streaming response');
      
      // Set appropriate headers for streaming
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no' // Disable nginx buffering
      });
      
      // Directly pipe the response to the client
      console.log('Streaming response started - directly piping');
      
      // Type the body as NodeJS.ReadableStream or appropriate stream type
      const responseBody = fetchResponse.body as unknown as NodeJS.ReadableStream;
      
      // Create manual piping with error handling
      responseBody.on('data', (chunk: Buffer | string) => { // Type chunk
        console.log(`Forwarding chunk of ${chunk.length} bytes`);
        if (!res.writableEnded) {
          res.write(chunk);
        }
      });
      
      responseBody.on('end', () => {
        console.log('API server stream ended');
        if (!res.writableEnded) {
          res.end();
        }
      });
      
      responseBody.on('error', (err: Error) => { // Type err
        console.error('Error in API server stream:', err);
        if (!res.writableEnded) {
          res.end();
        }
      });
      
      // Handle client disconnection
      req.on('close', () => {
        console.log('Client disconnected, handling cleanup');
        // Consider explicitly destroying the source stream if needed
        if (responseBody && typeof (responseBody as any).destroy === 'function') {
          (responseBody as any).destroy();
        }
      });
      
      return; // Return early as we're handling the response manually
    } else {
      // Handle regular responses
      const data: any = await fetchResponse.json(); // Use any or define a more specific type
      res.json(data);
      console.log('Regular response sent');
    }
  } catch (error: unknown) { // Type caught error as unknown
    console.error('Error processing chat request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (!res.headersSent) {
      res.status(500).json({ error: errorMessage });
    } else if (!res.writableEnded) {
      res.end();
    }
  }
});

// Legacy endpoint - /api/ai-chat
app.post('/api/ai-chat', async (req: Request<{}, {}, ChatRequestBody>, res: Response) => { // Type req.body
  console.log('Legacy chat request received');
  try {
    // Forward the request to our API server
    const apiServerUrl: string = 'http://api-server:3002/api/proxy/ai-chat';
    const { stream } = req.body;

    const fetchResponse: FetchResponse = await fetch(apiServerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': stream ? 'text/event-stream' : 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    if (!fetchResponse.ok) {
      throw new Error(`API server error: ${fetchResponse.status}`);
    }

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // Type the body and pipe
      const responseBody = fetchResponse.body as unknown as NodeJS.ReadableStream;
      responseBody.pipe(res);
      
      // Handle errors during piping
      responseBody.on('error', (err: Error) => {
        console.error('Error piping legacy stream:', err);
        if (!res.writableEnded) {
          res.end();
        }
      });

      req.on('close', () => {
        console.log('Client disconnected from legacy endpoint');
        if (responseBody && typeof (responseBody as any).destroy === 'function') {
          (responseBody as any).destroy();
        }
      });

    } else {
      const data: any = await fetchResponse.json(); // Use any or define a more specific type
      res.json(data);
    }
  } catch (error: unknown) { // Type caught error as unknown
    console.error('Error processing legacy chat request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // Avoid setting status/json if headers already sent (e.g., during streaming error)
    if (!res.headersSent) {
       res.status(500).json({ error: errorMessage });
    } else if (!res.writableEnded) {
       // If headers sent but stream errored, just end the response
       res.end();
    }
  }
});

// Test endpoint for API server - self responds without forwarding
app.post('/api/proxy/ai-chat', (req: Request, res: Response) => {
  console.log('Test endpoint called');
  
  // Return a fixed response for testing
  // Define a type for the response structure if possible
  res.json({
    id: 'test-' + Date.now(),
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: 'test-model',
    choices: [{
      index: 0,
      message: {
        role: 'assistant',
        content: 'This is a test response from the OpenRouter proxy.'
      },
      finish_reason: 'stop'
    }]
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`OpenRouter proxy server running on port ${PORT}`);
  console.log(`API endpoints: /api/chat/ai-chat and /api/ai-chat`);
}); 