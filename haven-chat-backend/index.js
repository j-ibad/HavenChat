const express = require('express');
const http = require('http');
const cors = require('cors');

const UserRouter = require('./controller/UserController.js');


const PORT_HTTP = 18070;
const PORT_HTTPS = 18071;


const app = express();
app.use(express.json());
app.use(cors({origin: '*'}));


app.use('/', express.static('dist'));
app.use('/api/user', UserRouter);



app.listen(PORT_HTTP, ()=>{
	console.log(`HavenChat listening on port ${PORT_HTTP}`);
});