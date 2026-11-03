#!/bin/sh
set -eu

envsubst '${PORT} ${BACKEND_URL}' \
    < /etc/nginx/nginx.conf.template \
    > /etc/nginx/conf.d/default.conf
