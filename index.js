'use strict';

// Imports dependencies and set up http server
const
  express = require('express'),
  bodyParser = require('body-parser'),
  fetch = require('fetch'),
  app = express().use(bodyParser.json()); // creates express http server

// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {

  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {

      // Gets the message. entry.messaging is an array, but 
      // will only ever contain one message, so we get index 0
      let webhook_event = entry.messaging[0];
      fetch('https://graph.facebook.com/v7.0/me/messages?access_token=EAADt1tZAb88cBAMfxyN1kHBld42Gywv7Sq5ZBhWAP9AZAcjEZAZALhwfyZBym3sEvRGavqdlmZBL5ZBZAgMMFD7ZCDUP6uxwcSWNfIthMn2PCQB8zfAa4XABGtSOVKtdSDvAaoy3GM55cweSshyqkccz1aoG2etgJ0azdbGImvYJf4CaqsIiPeKeLs', {
        method: "post",
        body: {
          "recipient": {
            "id": "100998771676257"
          },
          "message": {
            "text": "hello, world!"
          }
        },
      }).then((res) => res.json()).then((result) => {
        console.log(result)
      })
      console.log({ webhook_event: entry, messaging: webhook_event });
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send(body);
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = "<YOUR_VERIFY_TOKEN>"

  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {

    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});



// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));



// curl -X POST -H "Content-Type: application/json" -d '{
//   "recipient": {
//     "id": "100998771676257"
//   },
//   "message": {
//     "text": "hello, world!"
//   }
// }' "https://graph.facebook.com/v7.0/me/messages?access_token=EAADt1tZAb88cBAMfxyN1kHBld42Gywv7Sq5ZBhWAP9AZAcjEZAZALhwfyZBym3sEvRGavqdlmZBL5ZBZAgMMFD7ZCDUP6uxwcSWNfIthMn2PCQB8zfAa4XABGtSOVKtdSDvAaoy3GM55cweSshyqkccz1aoG2etgJ0azdbGImvYJf4CaqsIiPeKeLs"