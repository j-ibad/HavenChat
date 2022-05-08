const express = require('express');
const UserModel = require('../model/User.js');
const authorization = require('./authorization.js');

const router = express.Router();
router.use(authorization);


router.post('/getUsers', (req, res)=>{
	UserModel.getUsers(req.user.id, req.body).then((retVal)=>{
		res.json(retVal || {status: false, msg: 'An error has occured'});
	});
});

router.post('/getFriends', (req, res)=>{
	UserModel.getFriends(req.user.id, req.body).then((retVal)=>{
		res.json(retVal || {status: false, msg: 'An error has occured'});
	});
});

router.post('/getActiveFriends', (req, res)=>{
	UserModel.getFriends(req.user.id, req.body, 1).then((retVal)=>{
		res.json(retVal || {status: false, msg: 'An error has occured'});
	});
});

router.post('/getFriendRequests', (req, res)=>{
	UserModel.getFriendRequests(req.user.id, req.body).then((retVal)=>{
		res.json(retVal || {status: false, msg: 'An error has occured'});
	});
});

router.post('/sendFriendRequest', (req, res)=>{
	UserModel.sendFriendRequest(req.user.id, req.body).then((retVal)=>{
		res.json(retVal || {status: false, msg: 'An error has occured'});
	});
});

router.post('/acceptFriendRequest', (req, res)=>{
	UserModel.acceptFriendRequest(req.user.id, req.body).then((retVal)=>{
		res.json(retVal || {status: false, msg: 'An error has occured'});
	});
});

router.post('/denyFriendRequest', (req, res)=>{
	UserModel.denyFriendRequest(req.user.id, req.body).then((retVal)=>{
		res.json(retVal || {status: false, msg: 'An error has occured'});
	});
});

router.post('/deleteFriend', (req, res)=>{
	UserModel.deleteFriend(req.user.id, req.body).then((retVal)=>{
		res.json(retVal || {status: false, msg: 'An error has occured'});
	});
});


module.exports = router;