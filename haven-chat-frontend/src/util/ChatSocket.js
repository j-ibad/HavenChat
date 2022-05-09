import socket from './WebSocket.js'

const chatEvent = 'chat';

class ChatSocket {
	constructor(){ }
	
	request(pubKey, participants){
		socket.send(chatEvent, { 
			name: 'request',
			pubKey: pubKey,
			participants: participants
		});
	}
	
	accept(pubKey){
		socket.send(chatEvent, { 
			name: 'accept',
			pubKey: pubKey
		});
	}
	
	deny(){ socket.send(chatEvent, {name: 'deny'}); }
	
	send(msg){
		socket.send(chatEvent, { 
			name: 'send',
			msg: msg
		});
	}
	
	close(){ socket.send(chatEvent, {name: 'close'}); }
}


const ChatSocketInstance = new ChatSocket();
export default ChatSocketInstance;