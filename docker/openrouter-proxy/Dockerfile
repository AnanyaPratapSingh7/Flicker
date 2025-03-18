FROM node:23-alpine

WORKDIR /app

# Create package.json
RUN echo '{\
  "name": "openrouter-proxy",\
  "version": "1.0.0",\
  "description": "Proxy for OpenRouter API",\
  "main": "server.js",\
  "dependencies": {\
    "express": "^4.18.2",\
    "cors": "^2.8.5",\
    "node-fetch": "^2.7.0"\
  }\
}' > /app/package.json

# Install dependencies
RUN npm install

# Copy the server file
COPY server-files/openrouter-server.js /app/server.js

# Expose port 3003
EXPOSE 3003

# Start the server
CMD ["node", "server.js"] 