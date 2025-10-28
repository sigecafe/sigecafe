FROM node:lts

# Install dependencies for headless browser alternatives
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgbm1 \
    libnspr4 \
    libnss3 \
    libu2f-udev \
    xdg-utils \
    wget \
    chromium \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer environment variables to skip Chrome download and use a different browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV NODE_OPTIONS="--max-old-space-size=4096"

WORKDIR /nuxtapp

COPY . .

RUN npm install

RUN npm run build

# Install only production dependencies and Prisma
# Create an entrypoint script

RUN echo '#!/bin/sh\n\
echo "Waiting for database to be ready..."\n\
sleep 5\n\
echo "Running database migrations..."\n\
npx prisma migrate deploy\n\
echo "Starting application on host 0.0.0.0 port ${PORT:-10000}..."\n\
export PORT=${PORT:-10000}\n\
export NODE_ENV=production\n\
echo "Debug: PORT=$PORT"\n\
echo "Debug: NODE_ENV=$NODE_ENV"\n\
echo "About to start server..."\n\
node .output/server/index.mjs\n\
echo "Server command completed"\n\
' > /nuxtapp/entrypoint.sh && chmod +x /nuxtapp/entrypoint.sh

# Modify the server file to force host and port
RUN sed -i 's/listen(/listen(0.0.0.0, /g' .output/server/index.mjs || true
RUN sed -i 's/:3000/:10000/g' .output/server/index.mjs || true

# Expose the port that Render expects
EXPOSE 10000

CMD ["/nuxtapp/entrypoint.sh"]
