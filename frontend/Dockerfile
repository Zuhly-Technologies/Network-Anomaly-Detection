# Stage 1: Build the React frontend container
FROM node:16 as frontend-build-stage
WORKDIR /app/frontend
COPY package.json package-lock.json ./
RUN npm install
COPY ./ ./
RUN npm run build


# Stage 2: Serve the React frontend using Nginx
FROM nginx:1.25 as nginx-build-stage
COPY --from=frontend-build-stage /app/frontend/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf 
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
