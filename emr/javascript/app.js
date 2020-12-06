const morgan = require('morgan')
const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const cors = require('cors')
const port = process.env.PORT || 443;
const fs = require('fs');
var https = require('https');

var privateKey = fs.readFileSync('/etc/letsencrypt/live/api.emr-client.tech/privkey.pem');
var certificate = fs.readFileSync('/etc/letsencrypt/live/api.emr-client.tech/fullchain.pem');

var credentials = {key: privateKey, cert: certificate};

app.use(morgan('combined'))
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// CORS 
const whitelist = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://localhost:3000',
    'https://127.0.0.1:3000',
    'https://emr-client.tech'
]
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", whitelist);
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
});
 
let routes = require('./api/routes') 
routes(app)

app.use(function(req, res) {
    res.status(404).send({url: req.originalUrl + ' not found'})
})

// app.listen(port, () => {
//     console.log('RESTful API server started on port ' + port);
// });

var httpsServer = https.createServer(credentials, app);
httpsServer.listen(443);

