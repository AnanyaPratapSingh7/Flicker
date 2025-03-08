/**
 * OpenRouter proxy health check endpoint
 * 
 * Simple endpoint to check if the OpenRouter proxy service is running.
 */

module.exports = function(req, res) {
  res.json({
    status: 'ok',
    service: 'openrouter-proxy',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
};
