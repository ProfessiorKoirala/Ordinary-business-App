# Multi-stage production build for Google Cloud Run / Cloud Build
FROM node:22-slim AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
RUN npm install

# Copy source code and build client bundle
COPY . .
RUN npm run build

# Stage 2: Minimal runtime image
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install dependencies needed at runtime
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled frontend from build stage
COPY --from=builder /app/dist ./dist

# Copy backend server files
COPY server.ts tsconfig.json ./

# Cloud Run defaults to port 8080
EXPOSE 8080

# Start server using tsx
CMD ["npm", "start"]
