# Build stage
FROM oven/bun:1.1 AS builder
WORKDIR /app
COPY . .
RUN bun install
RUN bun run build

# Run stage (pakai nginx untuk serve static)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 