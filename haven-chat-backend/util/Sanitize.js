const {isStr} = require('./Helpers.js');

class Sanitize {
	constructor(){
		this.sqlBlacklist = /['";%_\0\b\n\r\t\Z\\]/g;
	}
	
	sqlSanitizeString(inStr){
		return inStr.replace(this.sqlBlacklist, '');
	}
	
	sqlSanitize(obj){
		for(let key of Object.keys(obj)){
			if(isStr(obj[key])){
				obj[key] = this.sqlSanitizeString(obj[key]);
			}
		}
		return obj;
	}
}

const Sanitizer = new Sanitize();
module.exports = Sanitizer;