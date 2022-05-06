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