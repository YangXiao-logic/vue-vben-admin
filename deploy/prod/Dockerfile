FROM registry.cn-hangzhou.aliyuncs.com/acs-sample/nginx:latest

RUN rm /etc/nginx/conf.d/default.conf

COPY deploy/prod/default.conf /etc/nginx/conf.d/
COPY apps/web-antd/dist/ /usr/share/nginx/html/

EXPOSE 80 443 8008
