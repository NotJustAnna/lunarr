#!/usr/bin/env bash
yarn prisma migrate deploy
node dist/src/index.js
