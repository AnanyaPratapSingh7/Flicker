FROM node:23-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

RUN npm install

COPY . .

# Set environment variable for Vite server proxy
ENV VITE_SERVER_PROXY_TARGET=http://openrouter-proxy:3003

EXPOSE 3004

# Set environment variable to prevent browser opening
ENV BROWSER=none

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 