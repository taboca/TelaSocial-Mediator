#!/bin/sh
# you may need npm install forever -g
cd /opt/telasocial-mediator
forever start mediator.js ./scripts/script-none.js
