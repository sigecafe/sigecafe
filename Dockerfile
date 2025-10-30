FROM oven/bun

RUN apt-get update -y && apt-get install -y openssl curl

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NODE_OPTIONS="--max-old-space-size=4096"

WORKDIR /nuxtapp

COPY . .

# Install dependencies without running postinstall
RUN bun install --ignore-scripts

# Run prepare and prisma generate separately
RUN bun run prisma:generate
RUN bunx nuxt prepare

RUN bun run build

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
