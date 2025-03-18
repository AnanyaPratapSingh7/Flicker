const http = require("http");
const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify({
      status: "ok",
      service: "ElizaOS Main (Minimal)",
      timestamp: new Date().toISOString()
    }));
  } else {
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify({
      status: "ok",
      message: "ElizaOS is running in minimal mode",
      endpoints: ["/health"]
    }));
  }
});

const PORT = process.env.ELIZAOS_PORT || 3005;
server.listen(PORT, () => {
  console.log(`ElizaOS minimal server running on port ${PORT}`);
}); 