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
		this.eventListeners = {};
		this.signMethod = 0;
		this.participants = [];
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
				this.signMethod = args.signMethod || 0;
				this.participants = [];
				
				// Generate pubKey pair, send request to server
				rsa.generateKeyPair({bits: 2048, workers: 2}, (err, keyPair)=>{
					this.privKey = keyPair.privateKey;
					this.pubKey = keyPair.publicKey;
					
					socket.send(chatEvent, { 
						name: 'request',
						sid: 0,
						pubKey: pki.publicKeyToPem(this.pubKey),
						signMethod: this.signMethod,
						participants: args.participants
					});
				});
			}else{  // Join existing chat by sid
				// TODO
			}
		}
	}
	
	deny(sid){ socket.send(chatEvent, {name: 'close', sid, active: 0}); }
	
	accept(sid){
		if(!this.active){
			this.active = true;
			rsa.generateKeyPair({bits: 2048, workers: 2}, (err, keyPair)=>{
				this.privKey = keyPair.privateKey;
				this.pubKey = keyPair.publicKey;
				
				socket.send(chatEvent, { 
					name: 'accept',
					sid,
					pubKey: pki.publicKeyToPem(this.pubKey)
				});
			});
		}
	}
	
	send(msg){
		// ENCRYPT MESSAGE
		//	Set up cipher
		let secret = forge.util.createBuffer(this.secret).getBytes();
		let cipher = forge.cipher.createCipher('AES-CBC', secret.toString());
		let iv = forge.random.getBytesSync(32);
		//	Encrypt message
		cipher.start({iv});
		cipher.update(forge.util.createBuffer(msg));
		cipher.finish();
		
		// SIGN MESSAGE
		let sign = '';
		let md = forge.md.sha1.create();
		md.update(msg, 'utf8');
		if(this.signMethod === 0){ //RSA
			sign = this.privKey.sign(md);
		}
		
		socket.send(chatEvent, { 
			name: 'send',
			sid: this.sid,
			msg: forge.util.encode64(cipher.output.getBytes()),
			iv: forge.util.bytesToHex(iv),
			sign: forge.util.encode64(sign)
		});
	}
	
	close(){
		if(this.active){
			this.active = false;
			socket.send(chatEvent, {name: 'close', sid: this.sid, active: 1});
			this.sid = 0;
			this.secret = '';
		}
	}
	
	
	/* [===== Message handlers (Receiving) =====] */
	msgHandler(self, data){
		switch(data.name){
			case "request": self.chat.handleRequest(self, data); break;
			case "accept": self.chat.handleAccept(self, data); break;
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
			this.sid = data.sid;
			this.participants = data.participants || [];
			this.participants.forEach((e)=>{
				e.id = e.userId;
				e.pubKey = pki.publicKeyFromPem(e.pubKey);
			});
			this.signMethod = data.signMethod || this.signMethod;
		}else{
			data.user.pubKey = pki.publicKeyFromPem(data.pubKey);
			this.participants.push(data.user);
			this.invokeListener(self, 'accept', data.user);
		}
	}
	
	async handleSend(self, data){
		if(this.secret){
			let iv = await forge.util.hexToBytes(data.iv);
			let msg_enc = await forge.util.decode64(data.msg);
			
			let decipher = await forge.cipher.createDecipher('AES-CBC', this.secret);
			await decipher.start({iv});
			await decipher.update(forge.util.createBuffer(msg_enc));
			await decipher.finish();
			let msg = await decipher.output.toString();
			
			// Verify signature
			let signature = forge.util.decode64(data.sign);
			let md = forge.md.sha1.create();
			md.update(msg, 'utf8');
			let verified = false;
			let sender = await this.participants.find((e)=>{return e.id == data.user.id});
			if(this.signMethod === 0){
				verified = await sender.pubKey.verify(md.digest().bytes(), signature);
			}
			
			this.invokeListener(self, 'send', {msg,  from: data.user, verified: verified});
		}
	}
	
	async handleClose(self, data){
		this.invokeListener(self, 'close', {active: data.active,  user: data.user});
	}
}

const ChatSocketInstance = new ChatSocket();
socket.loadChatSocket(ChatSocketInstance);

export default ChatSocketInstance;