FROM node:alpine

# Create app directory
RUN mkdir -p /usr/src/app \
    && mkdir -p /usr/src/app/log

WORKDIR /usr/src/app

COPY ./package.json /usr/src/app/package.json
COPY ./package-lock.json /usr/src/app/package-lock.json

ENV SHARED_SECRET=<32_CHARACTER_STRING>
ENV CONVO_WEBHOOK_URL=https://<MEDALLIA_CONVERSATION_HOST>/cg/mc/custom/<CHANNEL_GUID>

RUN env && npm ci --loglevel warn

# Bundle app source
COPY . /usr/src/app

EXPOSE 1338

CMD [ "npm", "start" ]
