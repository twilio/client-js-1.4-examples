const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const config = require('./config');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/getToken', (req, res) => {
  res.send(new twilio.Capability(config.accountSid, config.authToken)
    .allowClientIncoming(req.body.identity)
    .allowClientOutgoing(req.body.appSid || config.appSid)
    .generate())
});

app.use(express.static('public'));

const port = process.env.PORT || 3030;
app.listen(port);
console.info(`Serving on port ${port}...`);
