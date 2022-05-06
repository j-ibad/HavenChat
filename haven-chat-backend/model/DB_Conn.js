const mysql = require('mysql');
const Lock = require('../util/Lock.js');

class DB_Conn {
	constructor(sync=true){
		let mysqlConnectionParams = require('../config/db_creds.json');
		this.conn = mysql.createConnection(mysqlConnectionParams);
		this.queryLock = new Lock(sync);
	}
	
	query(sql, handler){
		this.queryLock.wait().then(()=>{
			this.conn.connect(async(e)=>{
				await this.conn.query(sql, (e, res)=>{
					handler(e, res);
					this.queryLock.unlock();
					if(this.conn.queue === 0){
						this.conn.end();
					}
				});
			});
		});
	}
}

module.exports = DB_Conn;