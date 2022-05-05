const EventEmitter = require('events');

class Lock {
	constructor(enabled = true){
		this.bus = new EventEmitter();
		this.locked = false;
		this.enabled = enabled;
	}
	
	wait(){
		return new Promise((res, rej)=>{
			if(this.locked && this.enabled){
				this.bus.once('unlock', ()=>{
					res('Success');
				});
			}else{
				this.lock();
				res('Success');
			}
		});
	}
	
	lock(){
		this.locked = true;
	}
	
	unlock(){
		this.bus.emit('unlock');
		this.locked = false;
	}
}

module.exports = Lock;