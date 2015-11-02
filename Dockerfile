FROM node:5

COPY . /src

RUN cd /src; npm install

CMD ["node", "/src/download.js", "/data/extensions.json"]
