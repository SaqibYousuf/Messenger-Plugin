'use strict';

// const { request } = require('express');

// Imports dependencies and set up http server

const
	express = require('express'),
	firebase = require('firebase'),
	//firebaseApp = require('firebase').app(),
	localStorage = require('node-localstorage').LocalStorage,
	bodyParser = require('body-parser'),
	fetch = require('node-fetch'),
	app = express().use(bodyParser.json()),
	request = require('request')
	; // creates express http server
var firebaseConfig = {
	apiKey: "AIzaSyAlFGoZEPc0rEYAYiUTnNYZmDbnkQdP20c",
	authDomain: "todo-app-25565.firebaseapp.com",
	databaseURL: "https://todo-app-25565.firebaseio.com",
	projectId: "todo-app-25565",
	storageBucket: "todo-app-25565.appspot.com",
	messagingSenderId: "600592089866",
	appId: "1:600592089866:web:1535bd7732529489"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

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
			let Code = localStorage.getItem('checkout_order_code')
			let PSID = webhook_event.sender.id;
			console.log(Code)
			var textmes = webhook_event.message.text
			if (PSID && textmes === 'fd here') {
				for (var i = 0; i < 4; i++) {
					postBack(PSID)
				}
			}
			console.log({ webhook_event: entry, messaging: webhook_event });
		});

		// Returns a '200 OK' response to all requests
		res.status(200).send(body);
	} else {
		// Returns a '404 Not Found' if event is not from a page subscription
		res.sendStatus(404);
	}

});
function postBack(PSID) {
	request({
		"uri": "https://graph.facebook.com/v7.0/me/messages",
		"qs": { "access_token": "EAADt1tZAb88cBAMfxyN1kHBld42Gywv7Sq5ZBhWAP9AZAcjEZAZALhwfyZBym3sEvRGavqdlmZBL5ZBZAgMMFD7ZCDUP6uxwcSWNfIthMn2PCQB8zfAa4XABGtSOVKtdSDvAaoy3GM55cweSshyqkccz1aoG2etgJ0azdbGImvYJf4CaqsIiPeKeLs" },
		"method": "POST",
		"json": {
			recipient: {
				// id: "3273760249321146"    saqib id
				id: PSID
			},
			message: {
				attachment: {
					type: "template",
					payload: {
						template_type: "generic",
						elements: [
							{
								title: "Welcome!",
								image_url: "https://4.img-dpreview.com/files/p/TS1200x900~sample_galleries/4973291808/1885203361.jpg",
								subtitle: "We have the right hat for everyone.",
								default_action: {
									type: "web_url",
									url: "https://4.img-dpreview.com/files/p/TS1200x900~sample_galleries/4973291808/1885203361.jpg",
									webview_height_ratio: "tall"
								},
								buttons: [
									{
										type: "web_url",
										url: "https://e-commerce-theme-cfa2d.web.app/",
										title: "View Website"
									}, {
										type: "postback",
										title: "Start Chatting",
										payload: "DEVELOPER_DEFINED_PAYLOAD"
									}
								]
							}
						]
					}
				}
			}
		}

	}, (err, res, body) => {
		if (!err) {
			console.log('message sent!')
		} else {
			console.log({ err, res })
		}
	})
}
// Adds support for GET requests to our webhook

app.get('/webhook', (req, res) => {
	console.log('runn get')
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

// All Api 

app.get('/get_allProducts', (req, res) => {
	firebase.database().ref('all_products').on('value', (snapShot) => {
		res.status(200).send(snapShot.val())
	})
})
app.post('/admin/post_product', (req, res) => {
	if (req.body) {

		firebase.database().ref().child('all_products').child(req.body.code).set(req.body).then((value) => {
			console.log(value)
			res.send({ success: true, message: "your data successfully send " })
		}).catch((err) => {
			res.send({ success: false, message: err.message })
		})
	}
})
app.post('/checkout', (req, res) => {
	if (req.body) {
		firebase.database().ref().child('checkout_orders').child(req.body.code).set(req.body).then((value) => {
			res.send({ success: true, message: `your order is save please send this code ${req.body.code} in our messenger page ` })
		}).catch((err) => {
			res.send({ success: false, message: err.message })
		})
	}
})
// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));