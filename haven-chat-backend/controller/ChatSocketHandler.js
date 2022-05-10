const forge = require('node-forge');
const rsa = forge.pki.rsa;
const pki = forge.pki;

const ChatModel = require('../model/Chat.js');

const chatEvent = 'chat';

module.exports = class ChatSocket {
	constructor(webSocketConnection){
		this.socket = webSocketConnection;
	}
	
	/* [===== Message handlers (Sending) =====] */
	request(sid, user, id=0){
		this.socket.send(chatEvent, { 
			name: 'request',
			sid,
			user
		}, id);
	}
	
	accept(sid, user, secret){
		if(this.socket.user.id === user.id){
			this.socket.send(chatEvent, { 
				name: 'accept',
				sid,
				user,
				secret
			});
		}else{
			
		}
	}
	
	deny(){ this.socket.send(chatEvent, {name: 'deny'}); }
	
	send(sid, msg, iv, sender, recv_uids){
		for(let recv_uid of recv_uids){
			this.socket.send(chatEvent, { 
				name: 'send',
				sid,
				iv,
				msg,
				user: sender
			}, recv_uid);
		}
	}
	
	close(){ this.socket.send(chatEvent, {name: 'close'}); }
	
	
	/* [===== Message handlers (Receiving) =====] */
	chatMsgHandler(self, data){
		switch(data.name){
			case "request": self.chat.handleRequest(self, data); break;
			case "accept": self.chat.handleAccept(self, data); break;
			case "deny": self.chat.handleDeny(self, data); break;
			case "send": self.chat.handleSend(self, data); break;
			case "close": self.chat.handleClose(self, data); break;
		}
	}
	
	async handleRequest(self, data){
		if(data.sid === 0){
			// console.log(`${self.user.username} requested to initiate chat`);
			let pubKey = pki.publicKeyFromPem(data.pubKey);
			let secretKey64 = forge.util.encode64(forge.random.getBytesSync(32)); //32 bytes for AES-256
			
			let res = await ChatModel.startChat(secretKey64);
			if(res.status){
				ChatModel.addParticipant(res.sid, self.user.id, 1);
				let secretKey64_enc64 = forge.util.encode64(pubKey.encrypt(secretKey64));
				self.chat.accept(res.sid, self.user, secretKey64_enc64);
				for(let i in data.participants){
					ChatModel.addParticipant(res.sid, data.participants[i].id);
					self.chat.request(res.sid, self.user, data.participants[i].id);
				}
			}else{
				self.error("Failed to start chat session");
			}
		}else{
			// console.log(`${self.user.username} requested to join existing chat ${sid}`);
			// TODO
		}
	}
	
	async handleAccept(self, data){
		// console.log(`${self.user.username} joined chat ${data.sid}`);
		let pubKey = pki.publicKeyFromPem(data.pubKey);
		
		let res = await ChatModel.getSecret(data.sid, self.user.id);
		if(res.status){
			ChatModel.activateParticipant(data.sid, self.user.id);
			let secretKey64 = res.secret;
			let secretKey64_enc64 = forge.util.encode64(pubKey.encrypt(secretKey64));
			self.chat.accept(data.sid, self.user, secretKey64_enc64);
		}else{
			self.error("Failed to start chat session");
		}
	}
	
	async handleDeny(self, data){
		// TODO
		// Remove participant from chat in ChatModel
	}
	
	async handleSend(self, data){
		// console.log(`${self.user.username} sent a message to chat ${data.sid}`);
		let res = await ChatModel.getParticipants(data.sid, self.user.id);
		if(res.status){
			self.chat.send(res.sid, data.msg, data.iv, self.user, res.participants);
		}
		// TODO
	}
	
	async handleClose(self, data){
		// TODO
	}
	
}