FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM nginx:1.27-alpine

ENV PORT=8080
ENV BACKEND_URL=https://campaign-manager-nasihond-be-ddf1f3d51d8b.herokuapp.com/

COPY nginx.conf /etc/nginx/nginx.conf.template
COPY render-nginx-config.sh /docker-entrypoint.d/40-render-nginx-config.sh
RUN chmod +x /docker-entrypoint.d/40-render-nginx-config.sh
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]