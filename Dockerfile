FROM node:16
COPY . /build/
WORKDIR /build/frontend
RUN yarn install && yarn build
WORKDIR /build
RUN yarn install && yarn prisma generate && yarn build && cp -vr frontend/build/ public/
ENTRYPOINT ["bash", "scripts/run-prod.sh"]
