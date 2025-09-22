# ---- Dependencies stage ----
FROM node:22-alpine3.22 AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# ---- Build stage ----
FROM node:22-alpine3.22 AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for your three env vars
ARG DISCORD_TOKEN
ARG DISCORD_ID
ARG DISCORD_GUILDID

# Make them available as ENV for scripts
ENV DISCORD_TOKEN=${DISCORD_TOKEN}
ENV DISCORD_ID=${DISCORD_ID}
ENV DISCORD_GUILDID=${DISCORD_GUILDID}

# Initialize DB
RUN node init_db.js

# Deploy slash commands
RUN node deploy-commands.js

# ---- Runner stage ----
FROM node:22-alpine3.22 AS runner
WORKDIR /app
COPY --from=build /app ./

ENV NODE_ENV=production
ENV PORT=3051
EXPOSE 3051

# Run as non-root user
RUN addgroup -S app && adduser -S app -G app
USER app

CMD ["npm", "start"]
