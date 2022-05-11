const forge = require('node-forge');
const rsa = forge.pki.rsa;
const pki = forge.pki;

const ChatModel = require('../model/Chat.js');

const chatEvent = 'chat';

module.exports = class ChatSocket {
	constructor(webSocketConnection){
		this.socket = webSocketConnection;
		this.accept = this.accept.bind(this);
	}
	
	/* [===== Message handlers (Sending) =====] */
	request(sid, user, id=0){
		this.socket.send(chatEvent, { 
			name: 'request',
			sid,
			user
		}, id);
	}
	
	accept(sid, user, args){
		if('secret' in args){
			this.socket.send(chatEvent, { 
				name: 'accept',
				secret: args.secret,
				user,
				sid
			});
		}else{
			for(let uid of args.participants){
				this.socket.send(chatEvent, { 
					name: 'accept',
					user,
					sid
				}, uid);
			}
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
			let pubKey = pki.publicKeyFromPem(data.pubKey);
			let secretKey16 = forge.util.createBuffer(forge.random.getBytesSync(32)).toHex(); //32 bytes for AES-256
			
			let res = await ChatModel.startChat(secretKey16);
			if(res.status){
				ChatModel.addParticipant(res.sid, self.user.id, 1);
				let secretKey16_enc16 = forge.util.createBuffer(pubKey.encrypt(secretKey16)).toHex();
				self.chat.accept(res.sid, self.user, {secret: secretKey16_enc16.toString()});
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
		let pubKey = pki.publicKeyFromPem(data.pubKey);
		
		let res = await ChatModel.getSecret(data.sid, self.user.id);
		if(res.status){
			ChatModel.activateParticipant(data.sid, self.user.id);
			let secretKey16 = await res.secret;
			let secretKey16_enc16 = await forge.util.createBuffer(pubKey.encrypt(secretKey16)).toHex();
			self.chat.accept(data.sid, self.user, {secret: secretKey16_enc16});
			let res2 = await ChatModel.getParticipants(data.sid, self.user.id);
			if(res2.status){
				self.chat.accept(res2.sid, self.user, {participants: res2.participants});
			}
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