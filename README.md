# yaydoc

[![Join the chat at https://gitter.im/fossasia/yaydoc](https://badges.gitter.im/fossasia/yaydoc.svg)](https://gitter.im/fossasia/yaydoc?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> Docs! Yay!
# Usage 
- install the travis in your local machine
```shell
gem install travis
```
- setup add ssh to your github profile. In order to do please follow the instruction given by github(https://help.github.com/articles/connecting-to-github-with-ssh/)
- go to folder where your ssh keys are generate. deafult folder(~/.ssh), login to your travis and execute the below command
```shell
travis login
travis encrypt-file <filename deafault filename: idrsa>
```
- push the idrsa.enc file to the repository
- set the following environmental variable to the travis       
     1) AUTHOR      (author of the repository)
     2) DOCPATH     (path of the documentation)
     3) EMAIL       (email of the author)
     4) GITURL      (ssh url not https)
     5) PROJECTNAME (project name)
     6) VERSION     (version of project)
     7) USERNAME    (github username)
- configure the travis as follow
```yml
language: python
python:
  - 3.5
before_install:
- openssl aes-256-cbc -K $encrypted_29cf7fe7b2e3_key -iv $encrypted_29cf7fe7b2e3_iv -in id_rsa.enc -out id_rsa -d
- echo -e "Host *\n\tStrictHostKeyChecking no\n" >> ~/.ssh/config
script: 
- wget https://raw.githubusercontent.com/sch00lb0y/yaydoc/master/generate.sh 
- chmod +x ./generate.sh
- pip install sphinx
- eval "$(ssh-agent -s)"
- chmod 600 id_rsa
- ssh-add id_rsa
- ./generate.sh
```
## note          
```yml
- openssl aes-256-cbc -K $encrypted_29cf7fe7b2e3_key -iv $encrypted_29cf7fe7b2e3_iv -in id_rsa.enc -out id_rsa -d
```
change the enviromental variable and file name according to your configuration 

