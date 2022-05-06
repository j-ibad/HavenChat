const express = require('express');
const UserModel = require('../model/User.js');

const router = express.Router();


router.post('/register', (req, res)=>{
	console.log('Registering');
	console.log(req.body);
	
	UserModel.register(req.body).then((retVal)=>{
		res.json(retVal || {status: false, msg: 'An error has occured'});
	});;
	
});


router.post('/login', (req, res)=>{
	console.log('Logging in');
	console.log(req.body);
	
	UserModel.login(req.body).then((retVal)=>{
		res.json(retVal || {status: false, msg: 'An error has occured'});
	});
	
});


module.exports = router;