# Build stage
FROM golang:1.24-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod download
RUN go build -o main .

# Run stage
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/main .
COPY --from=builder /app/bookingdb.sql .
COPY --from=builder /app/config ./config
COPY --from=builder /app/docs ./docs
ENV GIN_MODE=release
EXPOSE 8080
CMD ["./main"] 