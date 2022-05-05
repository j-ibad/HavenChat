const express = require('express');
const DB_Conn = require('./model/DB_Conn.js');

let conn = new DB_Conn();

conn.query("SELECT * FROM Test", (e, res)=>{
	console.log(res);
});

conn.query("INSERT INTO Test(id) VALUES (4)", (e, res)=>{
	console.log(res);
});


conn.query("SELECT * FROM Test; SELECT * FROM Test;", (e, res)=>{
	console.log(res);
});