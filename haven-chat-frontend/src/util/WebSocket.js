import Session from './Session.js'

const ws_url = ((process.env.NODE_ENV || '').trim() === 'development') ? 'ws://localhost:18072': 'wss://havenchat.ibad.one:18072';
const wsState = {
	connecting: 0,
	open: 1,
	closing: 2,
	closed: 3
}


class WebSocketWrapper {
	constructor(){
		this.socket = null;
		this.chat = null;
		this.msgHandlers = {
			
		}
	}
	
	uid(){ return Session.getSession().id; }
	
	loadChatSocket(chatSocket){
		this.chat = chatSocket;
		this.msgHandlers.chat = this.chat.msgHandler;
	}
	
	connect(){
		let self = this;
		if(!(this.socket && (this.socket.readyState === wsState.connecting || this.socket.readyState === wsState.open))){
			
			function heartbeat() {
				clearTimeout(self.pingTimeout);
				self.pingTimeout = setTimeout(() => {
					self.connect();
				}, 121000);
			}
			
			this.socket = new WebSocket(ws_url);
			this.socket.addEventListener('open', (e)=>{
				heartbeat();
			});

			this.socket.addEventListener('message', (e)=>{
				let msgObj = JSON.parse(e.data);
				let msgHandler = self.msgHandlers[msgObj.event];
				if(msgHandler){
					msgHandler(self, msgObj.data);
				}else{
					console.log(msgObj);
				}
			});
			
			this.socket.addEventListener('ping',  heartbeat);
			
			this.socket.addEventListener('close', function clear(){
				clearTimeout(self.pingTimeout);
			});
		}
	}
	
	send(event, data){
		this.connect();
		this.socket.send(JSON.stringify({event, data}));
	}
	
	close(){
		if(this.socket && this.socket.readyState !== wsState.closing && this.socket.readyState !== wsState.closed){
			clearTimeout(this.pingTimeout);
			this.socket.close();
		}
	}
}


const WebSocketInstance = new WebSocketWrapper();
export default WebSocketInstance;