FROM node:boron
MAINTAINER Ujjwal Bhardwaj <ujjwalb1996@gmail.com>

ARG COMMIT_HASH
ARG BRANCH
ARG REPOSITORY

ENV COMMIT_HASH ${COMMIT_HASH:-null}
ENV BRANCH ${BRANCH:-master}
ENV REPOSITORY ${REPOSITORY:-https://github.com/fossasia/yaydoc.git}

ENV INSTALL_PATH /yaydoc

RUN mkdir -p $INSTALL_PATH

WORKDIR $INSTALL_PATH

COPY . .

RUN echo deb http://http.debian.net/debian jessie-backports main >> /etc/apt/sources.list

RUN apt-get update && \
    apt-get install -y -t jessie-backports python python-dev python-pip python-virtualenv zip rsync openjdk-8-jdk && \
    rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64/
ENV PATH="$JAVA_HOME/bin:$PATH"

RUN bash setup.sh

WORKDIR $INSTALL_PATH/yaydoc

CMD [ "npm", "start" ]
