FROM oven/bun:1-slim

WORKDIR /app

# Copy package manifests and bun lockfile
COPY package.json bun.lock* ./

# Install dependencies with Bun
RUN bun install --frozen-lockfile || bun install

# Copy source tree
COPY . .

# Build client assets into /app/dist
RUN bun run build

# Declare persistent volume mount for SQLite data store
VOLUME ["/app/server/db"]

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["bun", "run", "start"]
