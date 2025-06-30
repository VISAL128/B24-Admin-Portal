FROM node:18-alpine

WORKDIR /app

# Copy package files first
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production

# Copy the built application
COPY .output .output

# Set environment to production
ENV NODE_ENV=production

# Expose the port that Nuxt.js runs on
EXPOSE 3000

CMD [ "node", ".output/server/index.mjs" ]