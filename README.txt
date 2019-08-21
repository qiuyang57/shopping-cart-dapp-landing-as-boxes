Build enviorment:

Install node.js

For mac:

Do the following steps:

Open terminal App and type:

$ brew update

Then, type:

$ brew install node

Install latest version of npm:

$ npm install npm@latest -g

For windows:

1.    Download the installation package of Node.

2.    Run the installer, then follow the prompt of installer.

3.    Restart computer.

Test Node.js and npm:

Type following command in terminal, if Node.js and npm are installed properlly, you should be able to see the simmilar information below.

$ node -v 

v9.7.1

$ npm -v

6.1.0


Install lite server:

Type the following command:

$ npm install lite-server --save-dev

$ yarn add lite-server --dev

Install truffle framework:

Type the following command:

$ npm install -g truffle

Adjust the version of solidity compiler for the project:

$ npm install -g solc@0.4.18



Setup and configuration:

Run our project:

Change the directory to project root directory:

$ cd ../shopping-cart-dapp-landing-as-boxes

Open Ganache or testrpc, keep it running(Ganache is recommended because of the user-friendly UI 
and visiable transaction of blockchain).

Then click the setting button, which at the topmost rightmost of user interface of Ganache, enter the 
setting page and change the port number as 8545.

Deploy our contract on testrpc network by using fruffle suite:

$ truffle migrate --reset --all 

If you donnot want to reset your constract, just type the following command:

$ truffle migrate --all

Then, run the server by typing following command:

$ npm run dev

The main page of our project should jump out, if it is not displayed by Chrome, unfortunately you need 
to copy the URL and open it in Chrome. 

Then log in the metamask, select network as customRPC with setted port number as 8545. The URL of
the network is http://localhost:8545.

If there are some unexpected error are displayed on browser console, you may need to restart Ganache
and metamask, re-migrate truffle contract. Then try your operation again.

Source codes are avaliable here:

https://drive.google.com/drive/folders/1a8kY_C3bO_Sx3hEpfSg4yIC1ARWPIvqT?usp=sharing

Thanks!
