# ═══════════════════════════════════════════════════════════
#  LIKE A SHH — Backend Dockerfile (Node.js Express)
# ═══════════════════════════════════════════════════════════

FROM node:20-alpine

WORKDIR /app

# Copy dependency files first for better caching
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p public/uploads/gallery

EXPOSE 5000

CMD ["node", "server.js"]
