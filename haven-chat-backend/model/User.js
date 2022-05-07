const bcrypt = require('bcrypt');

const DB_Conn = require('./DB_Conn.js');
const Sanitizer = require('../util/Sanitize.js');
const Lock = require('../util/Lock.js');

const saltRounds = 16;  // Cost of 16 (Default 10 deemed insecure for 2022)

class UserModel {
	constructor(){
		this.conn = new DB_Conn();
	}
	
	register(args){
		Sanitizer.sqlSanitize(args);
		
		let lock = new Lock();
		let retVal = {status: false, msg: 'An error has occured'};
		lock.lock();
		bcrypt.genSalt(saltRounds, (err, salt)=>{
			if(err){ lock.unlock(); return; }
			bcrypt.hash(args.password, salt, (err2, hash)=>{
				if(err2){ lock.unlock(); return; }
				let sqlQuery = "INSERT INTO User (username, password, createdDate, firstName, lastName, email) ";
				sqlQuery += `SELECT '${args.username}', '${hash}', CURRENT_TIMESTAMP(), '${args.fName}', '${args.lName}', '${args.email}' `;
				sqlQuery += `WHERE NOT EXISTS (SELECT * FROM User AS U WHERE U.username='${args.username}' OR U.email='${args.email}');`;
				
				this.conn.query(sqlQuery, (err3, res)=>{
					if(err3){ lock.unlock(); return; }
					retVal = {
						status: res && res.insertId > 0,
						msg: (res && res.insertId > 0) ? 'User registered successfully' : 'The username or email is already in use'
					};
					lock.unlock();
				});
			});
		});
		return lock.wait().then(()=>{ return retVal; });
	}
	
	login(args){
		Sanitizer.sqlSanitize(args);
		
		let sqlQuery = `SELECT U.id, U.username, U.firstName, U.lastName, U.email, U.password FROM User AS U WHERE U.username='${args.username}' LIMIT 1;`;
		let lock = new Lock();
		let retVal = {status: false, msg: 'An error has occured'};
		lock.lock();
		this.conn.query(sqlQuery, (err, res)=>{
			if(err){ lock.unlock(); return; }
			if(res.length >= 1 && res[0].password){
				let hash = res[0].password;
				bcrypt.compare(args.password, hash, (err2, res)=>{
					if(!err2){
						if(res){
							retVal = {status: true, msg: 'Login successful', user: res[0]};
						}else{
							retVal.msg = 'Invalid credentials.';
						}
					}
					lock.unlock();
				});
			}else{
				retVal.msg = 'Invalid credentials.';
				lock.unlock();
			}
		});
		return lock.wait().then(()=>{ return retVal; });
	}
}

const User = new UserModel();
module.exports = User;