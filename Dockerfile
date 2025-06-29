FROM oven/bun:1.1.27-slim
WORKDIR /app
COPY .output .output

CMD [ "bun",".output/server/index.mjs" ]