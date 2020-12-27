# Cookie Session Example
This example demonstrates the use of cookie session to store user credential 

1. Note the use of the `cookie-session` middleware.
2. Note the use of the `body-parser` middleware to extract `name` and `password` from `POST /login`.
3. Note the flow of control and how user credential is stored and destroyed in `session`.  After a successful login, the following name/value pairs are stored in `cookie-session`:
```
'authenticated': true
'username': <username>
```
### Using the AWS EC2 service
```
Instance ID
i-0920aa126a0b2b68e

1. Open an SSH client.
2. Locate your private key file. The key used to launch this instance is comps381--gp.pem
3. Run this command, if necessary, to ensure your key is not publicly viewable.
      chmod 400 comps381--gp.pem
4. Run this command, than type yes.
      ssh -i "comps381--gp.pem" ubuntu@ec2-54-87-44-83.compute-1.amazonaws.com
5. Run this command to get the server.js and other files.
      git clone https://github.com/DavidKwong000/comps381f-groupproject
6. Do npm install and npm start
7. Connect to to the page:
      ec2-54-87-44-83.compute-1.amazonaws.com:8099
```
### Installing
```
npm install
```
### Running
```
npm start
```
### Testing
Go to http://localhost:8099
