const express = require('express');
const http = require('http');


const PORT_HTTP = 18070;
const PORT_HTTPS = 18071;


const app = express();

app.use(express.json());


// app.get('/', (req, res)=>{
	// console.log('HavenChat received request');
	// res.send('Hello world!');
// });

app.use('/', express.static('dist'));

app.listen(PORT_HTTP, ()=>{
	console.log(`HavenChat listening on port ${PORT_HTTP}`);
});