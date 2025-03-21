FROM registry.cn-hangzhou.aliyuncs.com/acs-sample/nginx:latest

RUN rm /etc/nginx/conf.d/default.conf


COPY deploy/prod/default.conf /etc/nginx/conf.d/

COPY apps/web-antd/dist/ /usr/share/nginx/html/

# 创建存放 SSL 证书的目录
RUN mkdir -p /etc/nginx/ssl

# 复制 SSL 证书和私钥
COPY deploy/prod/manager.slidestutor.com.pem /etc/nginx/ssl/
COPY deploy/prod/manager.slidestutor.com.key /etc/nginx/ssl/

EXPOSE 80 443
