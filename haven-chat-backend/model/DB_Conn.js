const mysql = require('mysql');
const Lock = require('../util/Lock.js');

class DB_Conn {
	constructor(sync=true){
		let mysqlConnectionParams = require('../config/db_creds.json');
		this.pool = mysql.createPool(mysqlConnectionParams);
		this.queryLock = new Lock(sync);
	}
	
	query(sql, handler){
		this.queryLock.wait(true).then(()=>{
			this.pool.getConnection(async(err, conn)=>{
				if(err){
					handler(err, {});
					this.queryLock.unlock();
					return;
				}
				await conn.query(sql, (err2, res)=>{
					if(err2){
						handler(err2, {});
						this.queryLock.unlock();
						return;
					}
					handler(err2, res);
					this.queryLock.unlock();
					if(conn.queue === 0){
						conn.end();
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