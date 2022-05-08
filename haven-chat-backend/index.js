const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const WebSocketServer = require('ws').Server;

const JWT = require('./util/JWT.js');
const AuthRouter = require('./controller/AuthController.js');
const UserRouter = require('./controller/UserController.js');


const PORT_HTTP = 18070;
const PORT_HTTPS = 18071;
const PORT_WS = 18072;
const PORT_WSS = 18073;
const IS_PROD = (process.env.NODE_ENV || '').trim() !== 'development';

const corsConfig = {
    credentials: true,
    origin: true,
};

/* [===== Create Express Instance & Load Middleware =====] */
const app = express();
app.use(express.json());
app.use(cors(corsConfig));
app.use(cookieParser());


/* [===== Serve front-end =====] */
const reactRoutes = ['/home', '/logout'];
app.use('/', (req, res, next)=>{
	if(reactRoutes.includes(req.path)){
		return res.sendFile(path.join(__dirname, 'dist/index.html'));
	}else{
		return next();
	}
});
app.use('/', express.static('dist'));


/* [===== Load Controllers =====] */
app.use('/api/auth', AuthRouter);
app.use('/api/user', UserRouter);


/* [===== Serve app =====] */
if(IS_PROD){
	const https = require('https');
	const httpsServer = https.createServer({
		key: fs.readFileSync('/etc/letsencrypt/live/ibad.one/privkey.pem'),
		cert: fs.readFileSync('/etc/letsencrypt/live/ibad.one/fullchain.pem')
	}, app);

	httpsServer.listen(PORT_HTTPS, '0.0.0.0', ()=>{
		console.log(`ibad.one HTTPS Server running on port ${PORT_HTTPS}`);
	});
}

app.listen(PORT_HTTP, ()=>{
	console.log(`HavenChat listening on port ${PORT_HTTP}`);
});



function validateSocketJWT(cookie){
	if(cookie){
		let cookies = cookie.split(';');
		for(let i in cookies){
			let pair = cookies[i].split('=');
			if(pair[0].trim() === JWT.tokenName){
				let res = JWT.decodeToken(pair[1].trim());
				if(!('error' in res)){
					return res.token;
				}
			}
		}
	}
	return null;
}
const wss = new WebSocketServer({port: PORT_WS});
wss.on('connection', (client, req)=>{
	let token = validateSocketJWT(req.headers.cookie);
	console.log(token);
	if(!token){
		//TODO: Send error response
		console.log('Error');
		return;
	}
	
	client.on('message', (data)=>{
		console.log('received: %s', data);
	});
	
	client.send('something');
});