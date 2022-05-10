const DB_Conn = require('./DB_Conn.js');
const Sanitizer = require('../util/Sanitize.js');

class ChatModel {
	constructor(){
		this.conn = new DB_Conn();
		
	}
	
	async startChat(secret){
		secret = Sanitizer.sqlSanitizeString(secret);
		
		let sqlQuery = `INSERT INTO ChatSession(secret) SELECT '${secret}';`
		let res = await this.conn.queryAsync(sqlQuery);
		let retVal = {
			status: (res.status && res.data.insertId > 0),
			sid: (res.status && res.data.insertId) || 0
		}
		return retVal;
	}
	
	async addParticipant(sid, uid){
		uid = Number(uid);
		sid = Number(sid);
		
		let sqlQuery = `INSERT INTO ChatParticipants(sid, userId) `
		sqlQuery += `SELECT ${sid}, ${uid} WHERE NOT EXISTS `
		sqlQuery += `(SELECT * FROM ChatParticipants WHERE sid=${sid} AND userId=${uid});`
		let res = await this.conn.queryAsync(sqlQuery);
		let retVal = {status: (res.status && res.data.affectedRows > 0)};
		return retVal;
	}
	
	async getSecret(sid, uid){
		uid = Number(uid);
		sid = Number(sid);
		
		let sqlQuery = `SELECT secret FROM ChatSession WHERE id=${sid} AND `
		sqlQuery += `${uid} IN (SELECT userId FROM ChatParticipants WHERE sid=${sid});`
		
		let res = await this.conn.queryAsync(sqlQuery);
		let retVal = {status: res.status};
		if(res.status && res.data.length > 0){
			retVal.secret = res.data[0].secret;
		}
		return retVal;
	}
	
	async getUsers(uid, args){
		Sanitizer.sqlSanitize(args);
		
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
	
	async setInactive(uid){
		let sqlQuery = `UPDATE User SET disconnectedDate=CASE `
		sqlQuery += `WHEN CURRENT_TIMESTAMP <= connectedDate `
		sqlQuery += `THEN TIMESTAMPADD(SECOND, 1, connectedDate) `
		sqlQuery += `ELSE CURRENT_TIMESTAMP END `
		sqlQuery += `WHERE id=${uid};`;
		let res = await this.conn.queryAsync(sqlQuery);
		let retVal = {status: (res.status && res.data.affectedRows > 0)};
		return retVal;
	}
}

const Chat = new ChatModel();
module.exports = Chat;