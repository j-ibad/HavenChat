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
				sid,
				participants: args.participants || []
			});
		}else{
			for(let part of args.participants){
				this.socket.send(chatEvent, { 
					name: 'accept',
					user,
					sid,
					signMethod: args.signMethod,
					pubKey: args.pubKey
				}, part.userId);
			}
		}
	}
	
	send(sid, msg, sign, iv, sender, recipients){
		for(let recipient of recipients){
			this.socket.send(chatEvent, { 
				name: 'send',
				sid,
				iv,
				msg,
				sign,
				user: sender
			}, recipient.userId);
		}
	}
	
	close(sid, user, args){
		for(let participant of args.participants){
			this.socket.send(chatEvent, { 
				name: 'close',
				user,
				sid,
				active: args.active
			}, participant.userId);
		}
	}
	
	
	/* [===== Message handlers (Receiving) =====] */
	chatMsgHandler(self, data){
		switch(data.name){
			case "request": self.chat.handleRequest(self, data); break;
			case "accept": self.chat.handleAccept(self, data); break;
			case "send": self.chat.handleSend(self, data); break;
			case "close": self.chat.handleClose(self, data); break;
		}
	}
	
	async handleRequest(self, data){
		if(data.sid === 0){
			let pubKey = pki.publicKeyFromPem(data.pubKey);
			let secretKey16 = forge.util.createBuffer(forge.random.getBytesSync(32)).toHex(); //32 bytes for AES-256
			
			let res = await ChatModel.startChat(secretKey16, data.signMethod);
			if(res.status){
				ChatModel.addParticipant(res.sid, self.user.id, data.pubKey, 1);
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
			ChatModel.activateParticipant(data.sid, self.user.id, data.pubKey);
			let secretKey16 = await res.secret;
			let secretKey16_enc16 = await forge.util.createBuffer(pubKey.encrypt(secretKey16)).toHex();
			let res2 = await ChatModel.getParticipants(data.sid, self.user.id);
			self.chat.accept(data.sid, self.user, {secret: secretKey16_enc16, participants: res2.participants});
			if(res2.status){
				self.chat.accept(res2.sid, self.user, {participants: res2.participants, signMethod: res.signMethod, pubKey: data.pubKey});
			}
		}else{
			self.error("Failed to start chat session");
		}
	}
	
	async handleSend(self, data){
		let res = await ChatModel.getParticipants(data.sid, self.user.id);
		if(res.status){
			self.chat.send(res.sid, data.msg, data.sign, data.iv, self.user, res.participants);
		}
	}
	
	async handleClose(self, data){
		let res = await ChatModel.getParticipants(data.sid, self.user.id);
		if(res.status){
			self.chat.close(data.sid, self.user, {participants: res.participants, active: data.active});
		}
		ChatModel.deleteParticipant(data.sid, self.user.id);
	}
	
}