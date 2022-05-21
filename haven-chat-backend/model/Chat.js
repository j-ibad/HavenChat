const DB_Conn = require('./DB_Conn.js');
const Sanitizer = require('../util/Sanitize.js');

class ChatModel {
	constructor(){
		this.conn = new DB_Conn();
		
	}
	
	async startChat(secret, signMethod){
		secret = Sanitizer.sqlSanitizeString(secret);
		signMethod = Number(signMethod);
		
		let sqlQuery = `INSERT INTO ChatSession(secret, signMethod) SELECT '${secret}', ${signMethod};`
		let res = await this.conn.queryAsync(sqlQuery);
		let retVal = {
			status: (res.status && res.data.insertId > 0),
			sid: (res.status && res.data.insertId) || 0
		}
		return retVal;
	}
	
	async addParticipant(sid, uid, pubKey='', active=0){
		pubKey = Sanitizer.sqlSanitizeString(pubKey);
		uid = Number(uid);
		sid = Number(sid);
		
		let sqlQuery = `INSERT INTO ChatParticipants(sid, userId, pubKey, active) `
		sqlQuery += `SELECT ${sid}, ${uid}, '${pubKey}', ${active} WHERE NOT EXISTS `
		sqlQuery += `(SELECT * FROM ChatParticipants WHERE sid=${sid} AND userId=${uid});`
		let res = await this.conn.queryAsync(sqlQuery);
		let retVal = {status: (res.status && res.data.affectedRows > 0)};
		return retVal;
	}
	
	async activateParticipant(sid, uid, pubKey){
		pubKey = Sanitizer.sqlSanitizeString(pubKey);
		uid = Number(uid);
		sid = Number(sid);
		
		let sqlQuery = `UPDATE ChatParticipants SET active=1, pubKey='${pubKey}'`
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
		
		let sqlQuery = `SELECT secret, signMethod FROM ChatSession WHERE id=${sid} `
		sqlQuery += `AND ${this.isParticipantClause(uid, sid)};`
		
		let res = await this.conn.queryAsync(sqlQuery);
		let retVal = {status: res.status};
		if(res.status && res.data.length > 0){
			retVal.secret = res.data[0].secret;
			retVal.signMethod = res.data[0].signMethod
		}
		return retVal;
	}
	
	async getParticipants(sid, uid){
		uid = Number(uid);
		sid = Number(sid);
		
		let sqlQuery = `SELECT userId, pubKey FROM ChatParticipants WHERE `
		sqlQuery += `active=1 AND sid=${sid} AND userId<>${uid} `
		sqlQuery += `AND ${this.isParticipantClause(uid, sid)};`
		
		let res = await this.conn.queryAsync(sqlQuery);
		let retVal = {
			status: res.status,
			participants: (res.status && res.data) || []
		};
		retVal.participants.forEach((e)=>{
			console.log('PubKey: ');
			console.log(e.pubKey);
			e.pubKey = e.pubKey.replace('\\r', '\r').replace('\\n', '\n');
			console.log(e.pubKey);
		});
		return retVal;
	}
	
	async deleteParticipant(sid, uid){
		uid = Number(uid);
		sid = Number(sid);
		
		let sqlQuery = `DELETE FROM ChatParticipants WHERE sid=${sid} AND userId=${uid};`
		let res = await this.conn.queryAsync(sqlQuery);
		let retVal = {status: (res.status && res.data.affectedRows > 0)};
		if(res.status){
			sqlQuery = `DELETE FROM ChatSession WHERE id=${sid} AND NOT EXISTS `
			sqlQuery += `(SELECT * FROM ChatParticipants WHERE sid=${sid});`
			this.conn.queryAsync(sqlQuery).then((res2)=>{
				if(res2.data.affectedRows>0){
					console.log(`ChatSession ${sid} deleted`);
				}
			});
		}
		return retVal;
	}
}

const Chat = new ChatModel();
module.exports = Chat;