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
		self.onConnection();
	}
	
	onConnection(){
		let self = this;
		self.client.on('message', (data)=>{self.messageHandler(self, data)});
		self.client.on('pong', ()=>{self.heartbeat(self)});
		self.client.on('close', (data)=>{self.closeHandler(self)});
		
		UserModel.setActive(self.user.id);
	}
	
	heartbeat(self){
		// console.log(`Heartbeat: ${self.user.username}`);
		self.client.isAlive = true;
		UserModel.setActive(self.user.id);
	}
	
	messageHandler(self, data){
		// console.log('received: %s', data);
		self.client.send('Hello');
	}
	
	closeHandler(self){
		// console.log(`Closed: ${self.user.username}`);
		UserModel.setInactive(self.user.id);
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