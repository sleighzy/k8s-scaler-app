FROM node:14-alpine as build

WORKDIR /app

COPY package*.json /app/

RUN npm install

COPY . /app/

RUN npm run build

FROM nginx:alpine

ENV PROXY_PORT=8001

COPY ./nginx/templates/ /etc/nginx/templates/
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
