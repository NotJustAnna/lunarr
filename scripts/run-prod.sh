#!/usr/bin/env bash
yarn prisma migrate deploy
node dist/index.js
