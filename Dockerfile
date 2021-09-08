FROM node:alpine

# Create app directory
RUN mkdir -p /usr/src/app \
    && mkdir -p /usr/src/app/log

WORKDIR /usr/src/app

COPY ./package.json /usr/src/app/package.json
COPY ./package-lock.json /usr/src/app/package-lock.json

ENV CONVO_API_GATEWAY=https://<MEDALLIA_CONVERSATION_HOST>
ENV CHANNEL_GUID=<CHANNEL_GUID>
ENV CLIENT_ID=<CLIENT_ID>
ENV CLIENT_SECRET=<CLIENT_SECRET>
ENV AUTH_TYPE_OUTBOUND=<AUTH_TYPE_OUTBOUND>
ENV ACCESS_TOKEN=<ACCESS_TOKEN_FOR_API_TOKEN>
ENV DEFAULT_OAUTH_EXPIRES_SECS=<DEFAULT_OAUTH_EXPIRES_SECS>

RUN env && npm ci --loglevel warn

# Bundle app source
COPY . /usr/src/app

EXPOSE 1338

CMD [ "npm", "start" ]
