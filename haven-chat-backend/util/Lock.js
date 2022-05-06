const EventEmitter = require('events');

class Lock {
	constructor(enabled = true){
		this.bus = new EventEmitter();
		this.locked = false;
		this.enabled = enabled;
		this.queue = 0;
	}
	
	wait(useLock=false){
		return new Promise((res, rej)=>{
			this.queue++;
			if(this.locked && this.enabled){
				this.bus.once('unlock', ()=>{
					this.queue--;
					res('Success');
				});
			}else{
				if(useLock){
					this.lock();
				}
				this.queue--;
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