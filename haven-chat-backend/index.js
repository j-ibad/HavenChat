const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');

const JWT = require('./util/JWT.js');
const AuthRouter = require('./controller/AuthController.js');
const UserRouter = require('./controller/UserController.js');


const PORT_HTTP = 18070;
const PORT_HTTPS = 18071;

const corsConfig = {
    credentials: true,
    origin: true,
};

/* [===== Create Express Instance & Load Middleware =====] */
const app = express();
app.use(express.json());
app.use(cors(corsConfig));
app.use(cookieParser());


/* [===== Load controllers and serve front-end =====] */
app.use('/', express.static('dist'));
app.use('/api/auth', AuthRouter);
app.use('/api/user', UserRouter);


/* [===== Serve app =====] */
if((process.env.NODE_ENV || '').trim() !== 'development'){
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