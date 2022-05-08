const ws_url = ((process.env.NODE_ENV || '').trim() === 'development') ? 'ws://localhost:18072': 'ws://havenchat.ibad.one:18072';
const wsState = {
	connecting: 0,
	open: 1,
	closing: 2,
	closed: 3
}


class WebSocketWrapper {
	constructor(){
		this.socket = null;
	}
	
	connect(){
		let self = this;
		if(!(this.socket && (this.socket.readyState === wsState.connecting || this.socket.readyState === wsState.open))){
			
			function heartbeat() {
				clearTimeout(self.pingTimeout);
				self.pingTimeout = setTimeout(() => {
					self.socket.terminate();
				}, 31000);
			}
			
			this.socket = new WebSocket(ws_url);
			this.socket.addEventListener('open', (e)=>{
				this.socket.send('Client said something');
				heartbeat();
			});

			this.socket.addEventListener('message', (e)=>{
				console.log('Client received: %s', e.data);
			});
			
			this.socket.addEventListener('ping',  heartbeat);
			
			this.socket.addEventListener('close', function clear(){
				clearTimeout(self.pingTimeout);
			});
		}
	}
	
	close(){
		if(this.socket && this.socket.readyState !== wsState.closing && this.socket.readyState !== wsState.closed){
			this.socket.close();
		}
	}
	
}


const WebSocketInstance = new WebSocketWrapper();
export default WebSocketInstance;