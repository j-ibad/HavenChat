const DB_Conn = require('./DB_Conn.js');
const Sanitizer = require('../util/Sanitize.js');

class UserModel {
	constructor(){
		this.conn = new DB_Conn();
	}
	
	userFilterClause(filter){
		let sqlQueryClause = '';
		if(filter && filter.length > 0){
			let sqlFilter = `'${filter}%'`;
			sqlQueryClause = `(username LIKE ${sqlFilter} OR email LIKE ${sqlFilter} OR firstName LIKE ${sqlFilter} `;
			sqlQueryClause += `OR lastName LIKE ${sqlFilter}) ` 
		}else{
			sqlQueryClause = '1=1 ';
		}
		return sqlQueryClause;
	}
	
	async getUsers(uid, args){
		Sanitizer.sqlSanitize(args);
		uid = Number(uid);
		
		let sqlQuery = `SELECT id, username, email, firstName, lastName, `
		sqlQuery += `CASE WHEN connectedDate > disconnectedDate THEN 1 ELSE 0 END AS active `
		sqlQuery += `FROM User WHERE ${this.userFilterClause(args.filter)} `
		sqlQuery += `AND id NOT IN (SELECT ${uid} UNION `;
		sqlQuery += `SELECT userId FROM Friend WHERE friendId=${uid} AND block=0 UNION `;
		sqlQuery += `SELECT friendId FROM Friend WHERE userId=${uid} AND block=0) `
		sqlQuery += `ORDER BY username LIMIT 10;`;
		
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
	
	async getFriends(uid, args, active=0){
		Sanitizer.sqlSanitize(args);
		uid = Number(uid);
		active = Number(active);
		
		let sqlQuery = `SELECT id, username, email, firstName, lastName `
		if(active == 0){
			sqlQuery += `, CASE WHEN connectedDate > disconnectedDate THEN 1 ELSE 0 END AS active `
		}
		sqlQuery += `FROM User WHERE ${this.userFilterClause(args.filter)} AND id IN ( `;
		sqlQuery += `SELECT userId FROM Friend WHERE friendId=${uid} AND active=1 AND block=0 UNION `;
		sqlQuery += `SELECT friendId FROM Friend WHERE userId=${uid} AND active=1 AND block=0) `;
		sqlQuery += `AND id <> ${uid} ` + ((active != 0) ? 'AND connectedDate > disconnectedDate ' : '')
		sqlQuery += `ORDER BY username LIMIT 10;`;
		
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
		uid = Number(uid);
		
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
		uid = Number(uid);
		let targetId = Number(args.targetId);
		
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
		uid = Number(uid);
		let targetId = Number(args.targetId);
		
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
		uid = Number(uid);
		let targetId = Number(args.targetId);
		
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
		uid = Number(uid);
		let targetId = Number(args.targetId);
		
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
	
	
	
	async setActive(uid){
		uid = Number(uid);
		
		let sqlQuery = `UPDATE User SET connectedDate=CASE `
		sqlQuery += `WHEN CURRENT_TIMESTAMP <= disconnectedDate `
		sqlQuery += `THEN TIMESTAMPADD(SECOND, 1, disconnectedDate) `
		sqlQuery += `ELSE CURRENT_TIMESTAMP END `
		sqlQuery += `WHERE id=${uid};`;
		let res = await this.conn.queryAsync(sqlQuery);
		let retVal = {status: (res.status && res.data.affectedRows > 0)};
		return retVal;
	}
	
	async setInactive(uid){
		uid = Number(uid);
		
		let sqlQuery = `UPDATE User SET disconnectedDate=CASE `
		sqlQuery += `WHEN CURRENT_TIMESTAMP <= connectedDate `
		sqlQuery += `THEN TIMESTAMPADD(SECOND, 1, connectedDate) `
		sqlQuery += `ELSE CURRENT_TIMESTAMP END `
		sqlQuery += `WHERE id=${uid};`;
		let res = await this.conn.queryAsync(sqlQuery);
		let retVal = {status: (res.status && res.data.affectedRows > 0)};
		return retVal;
	}
	
	async isActive(uid){
		uid = Number(uid);
		
		let sqlQuery = `SELECT CASE WHEN connectedDate > disconnectedDate THEN 1 ELSE 0 END `;
		sqlQuery += `AS active FROM User WHERE uid=${uid} LIMIT 1;`
		let retVal = await this.conn.queryAsync(sqlQuery);
		return retVal || {status: false};
	}
}

const User = new UserModel();
module.exports = User;