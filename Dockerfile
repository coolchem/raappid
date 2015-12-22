FROM node:5.3.0

# Create app directory
RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

# Bundle app source
COPY . /usr/src/app

CMD ["node", "./src/bin/raappid.js" , "basic" , "testProject"]