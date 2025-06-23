# Step 1: Build the Vite app
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

# Step 2: Serve using NGINX
FROM nginx:1.28-alpine
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]