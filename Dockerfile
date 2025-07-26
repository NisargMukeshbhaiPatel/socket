# Build Next.js application
FROM node:18-alpine AS nextjs-builder
WORKDIR /socket-app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Final image
FROM node:18-alpine

WORKDIR /socket-app

# Download and setup PocketBase
RUN wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.21/pocketbase_0.22.21_linux_amd64.zip \
    && unzip pocketbase_0.22.21_linux_amd64.zip \
    && rm pocketbase_0.22.21_linux_amd64.zip \
    && chmod +x /socket-app/pocketbase

# Copy Next.js build from builder
COPY --from=nextjs-builder /socket-app/.next/standalone ./
COPY --from=nextjs-builder /socket-app/.next/static ./.next/static
COPY --from=nextjs-builder /socket-app/public ./public

# Copy PocketBase migrations
COPY pb_migrations ./pb_migrations

# Create volume for PocketBase data
VOLUME /socket-app/pb_data

# Expose ports for both services
EXPOSE 3000 8090

# Start both services
CMD ./pocketbase serve --http=0.0.0.0:8090 & node server.js