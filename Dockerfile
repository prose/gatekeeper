FROM node:4.2.1

ADD . /gatekeeper
WORKDIR /gatekeeper
RUN npm install

USER nobody
CMD node server.js
