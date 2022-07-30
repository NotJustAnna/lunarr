FROM node:16
WORKDIR /app
COPY . ./
RUN yarn install && yarn prisma generate && yarn build && yarn frontend install && yarn frontend build
ENTRYPOINT ["bash", "scripts/run-prod.sh"]
