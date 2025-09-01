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
sleep 20\n\
echo "Running database migrations..."\n\
npx prisma migrate reset --force\n\
echo "Running database seeds..."\n\
npm run db:seed\n\
echo "Starting application..."\n\
node .output/server/index.mjs\n\
' > /nuxtapp/entrypoint.sh && chmod +x /nuxtapp/entrypoint.sh

CMD ["/nuxtapp/entrypoint.sh"]
