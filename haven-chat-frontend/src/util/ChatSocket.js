import forge from 'node-forge';

import socket from './WebSocket.js'

const rsa = forge.pki.rsa;
const pki = forge.pki;
const chatEvent = 'chat';

class ChatSocket {
	constructor(){
		this.active = false;
		this.privKey = null;
		this.pubKey = null;
		this.secret = null;
		this.participants = [];
		this.messages = [];
		this.eventListeners = {};
	}
	
	setEventListener(event, component, handler){
		this.eventListeners[event] = {handler, component}
	}
	deleteEventListener(event, listener){ delete this.eventListeners[event]; }
	invokeListener(self, event, data){
		let tmpEventListener = this.eventListeners[event];
		if(tmpEventListener){
			tmpEventListener.handler(self, tmpEventListener.component, data);
		}
	}
	
	
	/* [===== Message handlers (Sending) =====] */
	request(args){
		if(!this.active){
			this.active = true;
			console.log('Starting chat session');
			
			if('participants' in args){  // Initiate chat
				rsa.generateKeyPair({bits: 2048, workers: 2}, (err, keyPair)=>{
					this.privKey = keyPair.privateKey;
					this.pubKey = keyPair.publicKey;
					this.participants = [];  // Start empty. Add as they accept.
					
					socket.send(chatEvent, { 
						name: 'request',
						sid: 0,
						pubKey: pki.publicKeyToPem(this.pubKey),
						participants: args.participants
					});
				});
			}else{  // Join existing chat by sid
				// TODO
			}
		}
	}
	
	accept(sid){
		if(!this.active){
			this.active = true;
			rsa.generateKeyPair({bits: 2048, workers: 2}, (err, keyPair)=>{
				this.privKey = keyPair.privateKey;
				this.pubKey = keyPair.publicKey;
				this.participants = [];  // Start empty. Add as they accept.
				
				socket.send(chatEvent, { 
					name: 'accept',
					sid,
					pubKey: pki.publicKeyToPem(this.pubKey)
				});
			});
		}
	}
	
	deny(){ socket.send(chatEvent, {name: 'deny'}); }
	
	send(msg){
		socket.send(chatEvent, { 
			name: 'send',
			msg
		});
	}
	
	close(){ 
		this.active = false;
		socket.send(chatEvent, {name: 'close'});
	}
	
	
	/* [===== Message handlers (Receiving) =====] */
	msgHandler(self, data){
		switch(data.name){
			case "request": self.chat.handleRequest(self, data); break;
			case "accept": self.chat.handleAccept(self, data); break;
			case "deny": self.chat.handleDeny(self, data); break;
			case "send": self.chat.handleSend(self, data); break;
			case "close": self.chat.handleClose(self, data); break;
			default: break;
		}
		console.log(data);
	}
	
	async handleRequest(self, data){
		console.log(`Received server invitation to chat ${data.sid} from ${data.user.username}`);
		// TODO: Prompt user
		// Extract data = {sid, user}
		this.invokeListener(self, 'request', data);
	}
	
	async handleAccept(self, data){
		if(data.user.id === self.uid()){
			console.log('Server accepted chat request');
			// Server accepted: Store chat config and join chat
			let secretKey64_enc = forge.util.decode64(data.secret);
			let secretKey64 = self.chat.privKey.decrypt(secretKey64_enc);
			self.chat.secret = forge.util.decode64(secretKey64);
			console.log(secretKey64);
			
			self.chat.sid = data.sid;
		}else{
			self.chat.participants.push(data.user);
		}
	}
	
	async handleDeny(self, data){
		// TODO
	}
	
	async handleSend(self, data){
		// TODO
	}
	
	async handleClose(self, data){
		// TODO
	}
}


const ChatSocketInstance = new ChatSocket();
socket.loadChatSocket(ChatSocketInstance);

export default ChatSocketInstance;