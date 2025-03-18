const http = require('http');

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  
  // Handle health check endpoint
  if (req.url === '/health') {
    console.log('Responding to health check request');
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({
      status: 'ok',
      service: 'ElizaOS Main (Proxy)',
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // Handle agent list endpoint
  if (req.url === '/agents') {
    console.log('Responding to agents list request');
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({
      agents: [
        {
          id: 'mock-agent-1',
          name: 'MockAgent',
          description: 'A mock agent for development purposes',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    }));
    return;
  }
  
  // Handle agent start endpoint (used for agent creation)
  if (req.url === '/agent/start' && req.method === 'POST') {
    console.log('Received agent start request');
    
    // Read the request body
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('Agent start request data:', JSON.stringify(data, null, 2));
        
        // Generate a unique agent ID
        const agentId = 'mock-agent-' + Date.now();
        
        // Respond with a success and the agent ID
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({
          status: 'ok',
          id: agentId,
          message: 'Agent created successfully'
        }));
      } catch (error) {
        console.error('Error parsing request body:', error);
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({
          status: 'error',
          message: 'Invalid request body'
        }));
      }
    });
    return;
  }
  
  // Handle message endpoint for specific agents
  if (req.url.match(/^\/[a-zA-Z0-9-]+\/message$/) && req.method === 'POST') {
    console.log('Received message request for an agent');
    
    // Extract agent ID from URL
    const agentId = req.url.split('/')[1];
    
    // Parse multipart/form-data or JSON
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        console.log('Received message body:', body);
        
        // Respond with a mock message response
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify([{
          role: 'assistant',
          content: `This is a mock response from agent ${agentId}. I've received your message.`
        }]));
      } catch (error) {
        console.error('Error processing message:', error);
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({
          status: 'error',
          message: 'Error processing message'
        }));
      }
    });
    return;
  }
  
  // Handle all other requests
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({
    status: 'ok',
    message: 'ElizaOS proxy server is running',
    endpoint: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  }));
});

const PORT = process.env.ELIZAOS_PROXY_PORT || 3007;

server.listen(PORT, () => {
  console.log(`ElizaOS proxy server running on port ${PORT}`);
}); 