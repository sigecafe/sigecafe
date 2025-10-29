FROM oven/bun

RUN apt-get update -y && apt-get install -y openssl

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

EXPOSE 10000

CMD ["bun", "run", "start"]
