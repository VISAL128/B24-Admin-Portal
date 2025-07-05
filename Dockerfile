FROM node:20-slim
WORKDIR /app



# Copy package files first
COPY package.json package-lock.json* ./
RUN npm install @oxc-parser/binding-linux-x64-gnu
RUN npm install @rollup/rollup-linux-x64-gnu

# Install dependencies
RUN npm install --production

# Copy the built application
COPY .output .output

# Set environment to production
ENV NODE_ENV=production

# Expose the port that Nuxt.js runs on
EXPOSE 3000

CMD [ "node", ".output/server/index.mjs" ]