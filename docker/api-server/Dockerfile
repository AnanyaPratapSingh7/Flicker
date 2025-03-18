FROM node:23-alpine

WORKDIR /app

# Create a minimal package.json
RUN echo '{"name":"api-server","version":"1.0.0","dependencies":{"express":"^4.18.2","cors":"^2.8.5","dotenv":"^16.3.1","axios":"^1.6.2","node-fetch":"^2.6.9"}}' > package.json

# Install dependencies
RUN npm install

# Copy only the API server files (no need for src now)
COPY api-server ./api-server

EXPOSE 3002

CMD ["node", "api-server/server.js"] 