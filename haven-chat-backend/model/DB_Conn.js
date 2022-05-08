const mysql = require('mysql');
const Lock = require('../util/Lock.js');

class DB_Conn {
	constructor(sync=true){
		let mysqlConnectionParams = require('../config/db_creds.json');
		this.conn = mysql.createConnection(mysqlConnectionParams);
		this.queryLock = new Lock(sync);
	}
	
	query(sql, handler){
		this.queryLock.wait(true).then(()=>{
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
	
	queryAsync(sql){
		let lock = new Lock();
		let retVal = {status: false, data: null};
		lock.lock();
		
		this.query(sql, (err, res)=>{
			if(err){
				retVal.err = err;
			}else{
				retVal.status = true;
				retVal.data = res;
			}
			lock.unlock();
		});
		return lock.wait().then(()=>{ return retVal; });
	}
}

module.exports = DB_Conn;