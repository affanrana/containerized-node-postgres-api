# Use an LTS Node image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the rest of the app
COPY . .

# Default port (match your server PORT env)
EXPOSE 13000

# Run DB migrations on startup, then start the server
# (requires: scripts/migrate.js and "migrate" script)
CMD ["sh", "-c", "npm run migrate && npm start"]
