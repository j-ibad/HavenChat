class WebSocketWrapper {
	constructor(){
		this.socket = null;
	}
	
	connect(){
		if(!(this.socket && (this.socket.readyState === 'CONNECTING' || this.socket.readyState === 'OPEN'))){
			this._setupConnection();
		}
	}
	
	_setupConnection(){
		this.socket = new WebSocket('ws://localhost:18072');
		this.socket.addEventListener('open', (e)=>{
			this.socket.send('Client said something');
		});

		this.socket.addEventListener('message', (e)=>{
			console.log('Client received: %s', e.data);
		});
	}
}


const WebSocketInstance = new WebSocketWrapper();
export default WebSocketInstance;