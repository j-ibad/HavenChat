const path = require('path');
const fs = require('fs');
const DB_Conn = require('./DB_Conn.js');

const fileFormat = 'utf8';

let conn = new DB_Conn();

const dirPath = path.join(__dirname, 'sql');
fs.readdir(dirPath, (e, dllFiles)=>{
	for(let dllFile of dllFiles){
		console.log(`[==== Running file: ${dllFile} ====]`);
		
		let sqlQueries = fs.readFileSync(path.join(dirPath, dllFile), fileFormat);
		
		for(let sqlQuery of sqlQueries.split(';')){
			if(sqlQuery){
				conn.query(sqlQuery, (e, res)=>{
					console.log(sqlQuery);
					if(e) console.log(e);
					if(res) console.log(res);
				});
			}
		}
		
		
	}
});