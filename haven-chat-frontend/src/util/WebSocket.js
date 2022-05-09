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
		this.msgHandler = {
			
		}
	}
	
	connect(){
		let self = this;
		if(!(this.socket && (this.socket.readyState === wsState.connecting || this.socket.readyState === wsState.open))){
			
			function heartbeat() {
				clearTimeout(self.pingTimeout);
				self.pingTimeout = setTimeout(() => {
					self.socket.close();
				}, 121000);
			}
			
			this.socket = new WebSocket(ws_url);
			this.socket.addEventListener('open', (e)=>{
				this.send("log", "Hello server!");
				heartbeat();
			});

			this.socket.addEventListener('message', (e)=>{
				let msgObj = JSON.parse(e.data);
				console.log('Client received: %s', JSON.stringify(msgObj));
			});
			
			this.socket.addEventListener('ping',  heartbeat);
			
			this.socket.addEventListener('close', function clear(){
				clearTimeout(self.pingTimeout);
			});
		}
	}
	
	chatMsgHandler(self, data){
		switch(data.name){
			case "request":
				console.log("RECEIVED CHAT REQUESTS");
		}
	}
	
	send(event, data){
		this.socket.send(JSON.stringify({event: event, data: data}));
	}
	
	close(){
		if(this.socket && this.socket.readyState !== wsState.closing && this.socket.readyState !== wsState.closed){
			this.socket.close();
		}
	}
	
}


const WebSocketInstance = new WebSocketWrapper();
export default WebSocketInstance;