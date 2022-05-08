const ws = new WebSocket('ws://localhost:18072');

ws.addEventListener('open', (e)=>{
	ws.send('Client said something');
});

ws.addEventListener('message', (e)=>{
	console.log('Client received: %s', e.data);
});

export default ws;