# Installing Yaydoc Locally

## Prerequisites
* NodeJS (v4.0 or above)
* Python 2.7 or 3.3+

## Steps for installation
1. Clone the original yaydoc repository or your own fork and move to the directory of the cloned repository

       git clone https://github.com/<username>/yaydoc.git
       cd yaydoc/
2. Copy contents of `.env.example` to `.env`, making necessary changes to the environment variables.
3. Run the following commands to install dependencies

       npm install
       pip install requirements.txt
4. Run the application using the following command and open the url in browser `http://localhost:3001`

       node ./bin/www
