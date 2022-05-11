const JWT = require('../util/JWT.js');
const UserModel = require('../model/User.js');

const ChatSocketHandler = require('./ChatSocketHandler.js');

const HEARTBEAT_INTERVAL = 120000; //Every 2 minutes

class WebSocketConnection {
	constructor(server, client, user){
		let self = this;
		self.server = server;
		self.client = client;
		self.client.user = self.user = user;
		self.client.isAlive = true;
		self.client.closeHandler = ()=>{
			UserModel.setInactive(self.user.id);
		}
		self.chat = new ChatSocketHandler(self);
		self.msgHandlers = {
			chat: self.chat.chatMsgHandler
		}
		
		self.onConnection();
	}
	
	onConnection(){
		let self = this;
		// Pass messages to proper message handler
		self.client.on('message', (data)=>{
			let msgObj = JSON.parse(data);
			let msgHandler = self.msgHandlers[msgObj.event];
			if(msgHandler){
				msgHandler(self, msgObj.data);
			}else{
				// self.send("log", "Hello!");  // REMOVE ME
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
	
	send(event, data, id=0){
		let tmpSocket = (id === 0) 
			? this.client 
			: Array.from(this.server.clients).find(elem => elem.user.id==id);
			
		tmpSocket && tmpSocket.send(JSON.stringify({event: event, data: data}));
	}
	
	error(msg){ this.send("error", {msg: msg}); }
}


module.exports = {
	connectionHandler: function(server, client, req){
		let token = JWT.validateRawCookie(req.headers.cookie);
		console.log(token && token.username);
		if(!token){
			client.close();
			return;
		}
		
		let connection = new WebSocketConnection(server, client, token);
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