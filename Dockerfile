FROM iojs

ADD . /gatekeeper
WORKDIR /gatekeeper
RUN npm install

USER nobody
CMD node server.js
