const DB_Conn = require('./DB_Conn.js');
const Sanitizer = require('../util/Sanitize.js');
const Lock = require('../util/Lock.js');

class UserModel {
	constructor(){
		this.conn = new DB_Conn();
	}
	
	getUsers(filter){
		
	}
}

const User = new UserModel();
module.exports = User;