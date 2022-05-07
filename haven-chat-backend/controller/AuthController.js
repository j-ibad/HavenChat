const express = require('express');
const AuthModel = require('../model/Auth.js');
const JWT = require('../util/JWT.js');

const router = express.Router();


router.post('/register', (req, res)=>{
	AuthModel.register(req.body).then((retVal)=>{
		res.json(retVal || {status: false, msg: 'An error has occured'});
	});;
	
});

router.post('/login', (req, res)=>{
	AuthModel.login(req.body).then((retVal)=>{
		if(retVal && retVal.status){
			let token = JWT.generateToken(retVal.user);
			res.cookie(JWT.tokenName, token, {
				httpOnly: true,
				secure: (process.env.NODE_ENV || '').trim() !== 'development',
				maxAge: JWT.maxAge
			});
			res.cookie("havenchat_session", retVal.user, {
				secure: (process.env.NODE_ENV || '').trim() !== 'development',
				maxAge: JWT.maxAge
			});
		}
		res.json(retVal || {status: false, msg: 'An error has occured'});
	});
});

router.post('/logout', (req, res)=>{
	res.clearCookie(JWT.tokenName);
	res.clearCookie("havenchat_session");
	return res.status(200).json({status: true, msg: "Successfully logged out"});
});

module.exports = router;