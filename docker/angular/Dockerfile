FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY front_end_angular/dist/dcf-production/browser/ ./
COPY docker/angular/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 4200

CMD ["nginx", "-g", "daemon off;"]
