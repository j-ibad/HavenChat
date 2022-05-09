const forge = require('node-forge');
const rsa = forge.pki.rsa;
const pki = forge.pki;

const JWT = require('../util/JWT.js');
const UserModel = require('../model/User.js');

const HEARTBEAT_INTERVAL = 2*60*1000; //Every 2 minutes

class WebSocketConnection {
	constructor(client, user){
		let self = this;
		self.client = client;
		self.user = user;
		self.client.isAlive = true;
		self.client.closeHandler = ()=>{
			UserModel.setInactive(self.user.id);
		}
		self.msgHandlers = {
			chat: self.chatMsgHandler
		}
		
		self.onConnection();
	}
	
	onConnection(){
		let self = this;
		// Pass messages to proper message handler
		self.client.on('message', (data)=>{
			console.log(data.toString());
			let msgObj = JSON.parse(data);
			console.log(msgObj);
			let msgHandler = self.msgHandlers[msgObj.event];
			if(msgHandler){
				msgHandler(self, msgObj.data);
			}else{
				self.send("log", "Hello!");
			}
		});
		
		// Heartbeat
		self.client.on('pong', ()=>{
			self.client.isAlive = true;
			UserModel.setActive(self.user.id);
		});
		
		// Close handler
		self.client.on('close', (data)=>{
			UserModel.setInactive(self.user.id);
		});
		
		UserModel.setActive(self.user.id);
	}
	
	chatMsgHandler(self, data){
		switch(data.name){
			case "request":
				console.log(`RECEIVED CHAT REQUESTS from ${self.user.username}`);
				console.log( pki.publicKeyFromPem(data.pubKey).encrypt('test') );
		}
	}
	
	send(event, data){
		this.client.send(JSON.stringify({event: event, data: data}));
	}
}


module.exports = {
	connectionHandler: function(client, req){
		let token = JWT.validateRawCookie(req.headers.cookie);
		console.log(token && token.username);
		if(!token){
			client.close();
			return;
		}
		
		let connection = new WebSocketConnection(client, token);
	},
	
	pingLoop: function(server){
		server.clients.forEach( (client)=>{
			if(client.isAlive === false) {
				if(client.closeHandler){
					client.closeHandler();
				}
				return client.terminate();
			}
			client.isAlive = false;
			client.ping();
		});
	},
	HEARTBEAT_INTERVAL: HEARTBEAT_INTERVAL
}