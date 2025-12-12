# Frontend Dockerfile (React)
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve stage using nginx
FROM nginx:1.25-alpine
# Copy build output
COPY --from=build /app/build /usr/share/nginx/html
# Provide a default nginx config that supports SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
