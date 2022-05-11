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
	
	async addParticipant(sid, uid, active=0){
		uid = Number(uid);
		sid = Number(sid);
		
		let sqlQuery = `INSERT INTO ChatParticipants(sid, userId, active) `
		sqlQuery += `SELECT ${sid}, ${uid}, ${active} WHERE NOT EXISTS `
		sqlQuery += `(SELECT * FROM ChatParticipants WHERE sid=${sid} AND userId=${uid});`
		let res = await this.conn.queryAsync(sqlQuery);
		let retVal = {status: (res.status && res.data.affectedRows > 0)};
		return retVal;
	}
	
	async activateParticipant(sid, uid){
		uid = Number(uid);
		sid = Number(sid);
		
		let sqlQuery = `UPDATE ChatParticipants SET active=1 `
		sqlQuery += `WHERE sid=${sid} AND userId=${uid};`
		let res = await this.conn.queryAsync(sqlQuery);
		let retVal = {status: (res.status && res.data.affectedRows > 0)};
		return retVal;
	}
	
	isParticipantClause(uid, sid, onlyActive=0){
		let sqlQueryClause =  `${uid} IN (SELECT userId FROM ChatParticipants WHERE `
		if(onlyActive==1){ sqlQueryClause += `active=1 AND `; }
		sqlQueryClause +=	`sid=${sid}) `;
		return sqlQueryClause;
	}
	
	async getSecret(sid, uid){
		uid = Number(uid);
		sid = Number(sid);
		
		let sqlQuery = `SELECT secret FROM ChatSession WHERE id=${sid} `
		sqlQuery += `AND ${this.isParticipantClause(uid, sid)};`
		
		let res = await this.conn.queryAsync(sqlQuery);
		let retVal = {status: res.status};
		if(res.status && res.data.length > 0){
			retVal.secret = res.data[0].secret;
		}
		return retVal;
	}
	
	async getParticipants(sid, uid){
		uid = Number(uid);
		sid = Number(sid);
		
		let sqlQuery = `SELECT userId FROM ChatParticipants WHERE `
		sqlQuery += `active=1 AND sid=${sid} AND userId<>${uid} `
		sqlQuery += `AND ${this.isParticipantClause(uid, sid)};`
		
		let res = await this.conn.queryAsync(sqlQuery);
		let retVal = {
			status: res.status,
			participants: (res.status && res.data.map(elem=>elem.userId)) || []
		};
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