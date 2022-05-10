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
	deleteEventListener(event){ delete this.eventListeners[event]; }
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
		let secret = forge.util.createBuffer(this.secret).getBytes();
		console.log(this.secret.length);
		console.log(secret.toString().length);
			
		let cipher = forge.cipher.createCipher('AES-CBC', secret.toString());
		let iv = forge.random.getBytesSync(32);
		
		cipher.start({iv});
		cipher.update(forge.util.createBuffer(msg));
		cipher.finish();
		socket.send(chatEvent, { 
			name: 'send',
			sid: this.sid,
			msg: forge.util.encode64(cipher.output.getBytes()),
			iv: forge.util.bytesToHex(iv)
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
		this.invokeListener(self, 'request', data);
	}
	
	async handleAccept(self, data){
		if(data.user.id === self.uid()){
			let secretKey16_enc = await forge.util.hexToBytes(data.secret);
			let secretKey16 = await this.privKey.decrypt(secretKey16_enc);
			this.secret = await forge.util.hexToBytes(secretKey16);
			console.log(this.secret.length);
			
			this.sid = data.sid;
		}else{
			this.participants.push(data.user);
		}
	}
	
	async handleDeny(self, data){
		// TODO
	}
	
	async handleSend(self, data){
		if(this.secret){
			let iv = await forge.util.hexToBytes(data.iv);
			let msg_enc = await forge.util.decode64(data.msg);
			
			let secret = await forge.util.createBuffer(this.secret).getBytes();
			console.log(secret.toString().length);
			
			let decipher = await forge.cipher.createDecipher('AES-CBC', secret.toString());
			await decipher.start({iv});
			await decipher.update(forge.util.createBuffer(msg_enc));
			await decipher.finish();
			let msg = await decipher.output.toString();
			
			this.invokeListener(self, 'send', {msg,  from: data.user});
		}
	}
	
	async handleClose(self, data){
		// TODO
	}
}


const ChatSocketInstance = new ChatSocket();
socket.loadChatSocket(ChatSocketInstance);

export default ChatSocketInstance;