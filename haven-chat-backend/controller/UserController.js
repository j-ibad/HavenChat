const express = require('express');
const UserModel = require('../model/User.js');
const authorization = require('./authorization.js');

const router = express.Router();
router.use(authorization);


router.post('/getUsers', (req, res)=>{
	
	
	res.json({status: true});
});


module.exports = router;