FROM node:boron

RUN echo deb http://http.debian.net/debian jessie-backports main >> /etc/apt/sources.list

# Update and install packages
RUN apt-get update && \
    apt-get install -y -t jessie-backports python python-dev python-pip python-virtualenv zip rsync openjdk-8-jdk && \
    rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64/
ENV PATH="$JAVA_HOME/bin:$PATH"

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json .

RUN npm install

# Install python dependencies
COPY requirements.txt /usr/src/app/
RUN pip install -r /usr/src/app/requirements.txt

# Install Heroku CLI
RUN wget -qO- https://cli-assets.heroku.com/install-ubuntu.sh | sh

# Bundle app source
COPY . .

EXPOSE 3001
CMD [ "npm", "start" ]
