#!/bin/bash

cd /app && sleep 1 && apt-get install -y nodejs && npm install && npm run build && npm run start