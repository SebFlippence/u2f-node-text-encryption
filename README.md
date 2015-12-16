U2F Node Text Encryption
========================

Use a password and [U2F Key](https://en.wikipedia.org/wiki/Universal_2nd_Factor) to encrypt text.

This project was created as part of hack day, so the encryption output should not be trusted! There may also be an issue with using the U2F Key Handle as the password salt.

Originally based on [Using U2F 2-factor keys with Node.js](https://jaxbot.me/articles/nodejs-u2f-keys-yubikey).

## Requirements

* A [U2F Key](https://en.wikipedia.org/wiki/Universal_2nd_Factor)
* Node.js
* Google Chrome

## Setup
### Install dependencies
```
npm install
npm install -g bower && bower install
```

### Create a HTTPS Self-signed certificate
Example taken from: [How to create a self-signed SSL Certificate](http://www.akadia.com/services/ssh_test_certificate.html).

```
openssl genrsa -des3 -out server.key 1024
openssl req -new -key server.key -out server.csr
cp server.key server.key.org
openssl rsa -in server.key.org -out server.key
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt
```

### Running
```
npm start
```

Server will be available at: https://localhost:4433/
