const DB_Conn = require('./DB_Conn.js');
const Sanitizer = require('../util/Sanitize.js');
const Lock = require('../util/Lock.js');

class UserModel {
	constructor(){
		this.conn = new DB_Conn();
	}
	
	async getUsers(uid, args){
		Sanitizer.sqlSanitize(args);
		let filter = `'${args.filter}%'`;
		
		let sqlQuery = `SELECT id, username, email, firstName, lastName FROM User WHERE ( `;
		sqlQuery += `username LIKE ${filter} OR email LIKE ${filter} OR firstName LIKE ${filter} `;
		sqlQuery += `OR lastName LIKE ${filter}) AND id NOT IN (SELECT ${uid} UNION `;
		sqlQuery += `SELECT userId FROM Friend WHERE friendId=${uid} AND block=0 UNION `;
		sqlQuery += `SELECT friendId FROM Friend WHERE userId=${uid} AND block=0) LIMIT 10;`;
		
		let retVal = {status: false};
		let res = await this.conn.queryAsync(sqlQuery);
		if(!res.status){
			retVal.msg = 'An error has occured';
		}else{
			retVal.status = res.status;
			retVal.users = res.data;
		}
		return retVal;
	}
	
	async getFriends(uid, args){
		Sanitizer.sqlSanitize(args);
		
		let sqlQuery = `SELECT id, username, email, firstName, lastName FROM User WHERE id IN ( `;
		sqlQuery += `SELECT userId FROM Friend WHERE friendId=${uid} AND active=1 AND block=0 UNION `;
		sqlQuery += `SELECT friendId FROM Friend WHERE userId=${uid} AND active=1 AND block=0) `;
		sqlQuery += `AND id <> ${uid} LIMIT 10;`;
		
		let retVal = {status: false};
		let res = await this.conn.queryAsync(sqlQuery);
		if(!res.status){
			retVal.msg = 'An error has occured';
		}else{
			retVal.status = res.status;
			retVal.friends = res.data;
		}
		return retVal;
	}
	
	async getFriendRequests(uid, args){
		Sanitizer.sqlSanitize(args);
		
		let sqlQuery = `SELECT id, username, email, firstName, lastName FROM User WHERE id IN ( `;
		sqlQuery += `SELECT userId FROM Friend WHERE friendId=${uid} AND active=0 AND block=0) `;
		sqlQuery += `LIMIT 10;`
		
		let retVal = {status: false};
		let res = await this.conn.queryAsync(sqlQuery);
		if(!res.status){
			retVal.msg = 'An error has occured';
		}else{
			retVal.status = res.status;
			retVal.friendRequests = res.data;
		}
		return retVal;
	}
	
	async sendFriendRequest(uid, args){
		Sanitizer.sqlSanitize(args);
		let targetId = args.targetId;
		
		let sqlQuery = `INSERT INTO Friend(userId, friendId, createdDate) `
		sqlQuery += `SELECT ${uid}, ${targetId}, CURRENT_TIMESTAMP() `
		sqlQuery += `WHERE NOT EXISTS (SELECT * FROM Friend WHERE `
		sqlQuery += `(userId=${uid} AND friendId=${targetId}) OR `
		sqlQuery += `(userId=${targetId} AND friendId=${uid}) );`
		
		let retVal = {status: false};
		let res = await this.conn.queryAsync(sqlQuery);
		if(!res.status){
			retVal.msg = 'An error has occured';
		}else{
			retVal.status = (res.data.affectedRows > 0);
			retVal.msg = (retVal.status) ? 'Friend request sent' : 'Failed to send friend request';
		}
		return retVal;
	}
	
	async acceptFriendRequest(uid, args){
		Sanitizer.sqlSanitize(args);
		let targetId = args.targetId;
		
		let sqlQuery = `UPDATE Friend SET active=1 WHERE userId=${targetId} `
		sqlQuery += `AND friendId=${uid} AND active=0 AND block=0;`
		
		let retVal = {status: false};
		let res = await this.conn.queryAsync(sqlQuery);
		if(!res.status){
			retVal.msg = 'An error has occured';
		}else{
			retVal.status = (res.data.affectedRows > 0);
			retVal.msg = (retVal.status) ? 'Friend request accepted' : 'Failed to accept friend request';
		}
		return retVal;
	}
	
	async denyFriendRequest(uid, args){
		Sanitizer.sqlSanitize(args);
		let targetId = args.targetId;
		
		let sqlQuery = `DELETE FROM Friend WHERE friendId=${uid} AND `
		sqlQuery += `userId=${targetId} AND block=0 AND active=0;`
		
		let retVal = {status: false};
		let res = await this.conn.queryAsync(sqlQuery);
		if(!res.status){
			retVal.msg = 'An error has occured';
		}else{
			retVal.status = (res.data.affectedRows > 0);
			retVal.msg = (retVal.status) ? 'Friend request denied' : 'Failed to deny friend request';
		}
		return retVal;
	}
	
	async deleteFriend(uid, args){
		Sanitizer.sqlSanitize(args);
		let targetId = args.targetId;
		
		let sqlQuery = `DELETE FROM Friend WHERE block=0 AND active=1 `
		sqlQuery += ` AND ( (userId=${uid} AND friendId=${targetId}) OR `
		sqlQuery += `(userId=${targetId} AND friendId=${uid}) );`
		
		let retVal = {status: false};
		let res = await this.conn.queryAsync(sqlQuery);
		if(!res.status){
			retVal.msg = 'An error has occured';
		}else{
			retVal.status = (res.data.affectedRows > 0);
			retVal.msg = (retVal.status) ? 'Friend removed' : 'Failed to remove friend request';
		}
		return retVal;
	}
}

const User = new UserModel();
module.exports = User;