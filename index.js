var express = require('express');
var bodyParser = require('body-parser');
var engines = require('consolidate');
var app = express();
var https = require('https');
var fs = require('fs');
var path = require('path');
var u2f = require('u2f');

var dirty = require('dirty');
var db = dirty('./secret_data.json');

var cipher = require('./lib/cipher');

var APP_ID = 'https://localhost:4433';

app.use(bodyParser.json());
app.use(require('cookie-parser')());
app.engine('html', engines.hogan);
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));

app.get('/', function(req, res) {
    var files = [];
    db.forEach(function(key, val) {
        files.push(key);
    });

    res.render('index.html', {files: files});
});

app.post('/api/register_request', function(req, res) {
    var authRequest = u2f.request(APP_ID),
        data = {
            'authRequest': authRequest
        };
    db.set(req.body.filename, data);
    res.send(JSON.stringify(authRequest));
});

app.post('/api/register', function(req, res) {
    var checkRes = u2f.checkRegistration(
        db.get(req.body.filename).authRequest,
        req.body.u2fAuthRequest
    );
    if (checkRes.successful) {
        // Note that I'm using the U2F Key Handle here as the salt
        // This could be considdered as insecure as the salt is stored with the data
        var content = cipher.encrypt(
                req.body.password,
                checkRes.keyHandle,
                req.body.content
            ),
            data = {
                publicKey: checkRes.publicKey,
                keyHandle: checkRes.keyHandle,
                content: content
            };
        db.set(req.body.filename, data);
        res.send(true);
    } else {
        res.send(checkRes.errorMessage);
    }
});

app.post('/api/sign_request', function(req, res) {
    var storedData = db.get(req.body.filename),
        authRequest = u2f.request(APP_ID, storedData.keyHandle);

    storedData.authRequest = authRequest;
    db.set(req.body.filename, storedData);
    res.send(JSON.stringify(authRequest));
});

app.post('/api/authenticate', function(req, res) {
    var storedData = db.get(req.body.filename);
    var checkRes = u2f.checkSignature(
            storedData.authRequest,
            req.body.u2fAuthRequest,
            storedData.publicKey
        );

    if (checkRes.successful) {
        var content = cipher.decrypt(
            req.body.password,
            storedData.keyHandle,
            storedData.content.tagHex,
            storedData.content.encryptedHex
        );

        res.send({ success: true, content: content });
    } else {
        res.send({ error: checkRes.errorMessage });
    }
});

var credentials = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.crt')
};
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(4433, function() {
    console.log('Server running at: https://localhost:4433/');
});
