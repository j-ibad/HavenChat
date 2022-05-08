import React from 'react';

import {api} from './util/api.js'
import SessionRequired from './component/SessionRequired.js'
import List from './component/List.js'
import {Tab, TabContent} from './component/Tab.js';
import './css/Contacts.css';

const searchUserFields = [
	{key: 'active', header: 'Active'},
	{key: 'username', header: 'Username'},
	{key: 'firstName', header: 'First Name'},
	{key: 'lastName', header: 'Last Name'},
	{key: 'addBtn', header: ''}
];

const friendRequestFields = [
	{key: 'username', header: 'Username'},
	{key: 'firstName', header: 'First Name'},
	{key: 'lastName', header: 'Last Name'},
	{key: 'acceptBtn', header: ''},
	{key: 'denyBtn', header: ''}
];

const friendFields = [
	{key: 'active', header: 'Active'},
	{key: 'username', header: 'Username'},
	{key: 'firstName', header: 'First Name'},
	{key: 'lastName', header: 'Last Name'},
	{key: 'unfriendBtn', header: ''}
]

class ContactsPage extends React.Component {
	render(){
		return(<div className="Contacts">
			<Tab style={{width: '100%', margin: '1em 4em', border: 'none'}} className="Left Lite">
				<TabContent label="Friends"> <FriendsPane /> </TabContent> 
				<TabContent label="Find"> <SearchUserPane /> </TabContent> 
			</Tab>
			<SessionRequired />
		</div>);
	}
}


class FriendsPane extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			friends: [],
			filter: ""
		}
		this.filterChangeHandler = this.filterChangeHandler.bind(this);
	}
	
	componentDidMount(){
		this.initData();
	}
	
	initData(){
		this.getFriends(this.state.filter);
	}
	
	
	filterChangeHandler(e){
		const filter = (e.target && e.target.value) || "";
		let self = this;
		this.setState({filter: filter}, ()=>{
			self.getFriends(filter);
		});
	}
	
	unfriend(id){
		let self = this;
		api.post('/user/deleteFriend', {targetId: id}).then((res)=>{
			if(res.data && res.data.status){
				// TODO: Success message
				self.initData();
			}else{
				// TODO: Failed message
			}
		});
	}
	
	getFriends(filter=""){
		let self = this;
		api.post('/user/getFriends', {filter: filter}).then((res)=>{
			if(res.data && filter === this.state.filter){
				for(let i in res.data.friends){
					res.data.friends[i].unfriendBtn = (
						<button onClick={()=>{this.unfriend(res.data.friends[i].id)}} className="UnfriendBtn">-</button>
					);
				}
				self.setState({friends: res.data.friends || []});
			}
		});
	}
	
	render(){
		return (<div>
			<input type="text" onChange={this.filterChangeHandler} placeholder="Search for Users" />
			
			{(this.state.friends.length > 0)
				? <List title="Friends" data={this.state.friends} fields={friendFields} key={this.state.filter}/>
				: <p> No friends found </p>
			}
		</div>);
	}
}

class SearchUserPane extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			users: [],
			friendRequests: [],
			filter: ""
		}
		this.filterChangeHandler = this.filterChangeHandler.bind(this);
	}
	
	componentDidMount(){
		this.initData();
	}
	
	initData(){
		this.getUsers(this.state.filter);
		this.getFriendRequests();
	}
	
	
	filterChangeHandler(e){
		const filter = (e.target && e.target.value) || "";
		let self = this;
		this.setState({filter: filter}, ()=>{
			self.getUsers(filter);
		});
	}
	
	requestFriend(id){
		let self = this;
		api.post('/user/sendFriendRequest', {targetId: id}).then((res)=>{
			if(res.data && res.data.status){
				// TODO: Success message
				self.initData();
			}else{
				// TODO: Failed message
			}
		});
	}
	
	acceptFriend(id){
		let self = this;
		api.post('/user/acceptFriendRequest', {targetId: id}).then((res)=>{
			if(res.data && res.data.status){
				// TODO: Success message
				self.initData();
			}else{
				// TODO: Failed message
			}
		});
	}
	
	denyFriend(id){
		let self = this;
		api.post('/user/denyFriendRequest', {targetId: id}).then((res)=>{
			if(res.data && res.data.status){
				// TODO: Success message
				self.initData();
			}else{
				// TODO: Failed message
			}
		});
	}
	
	getUsers(filter=""){
		let self = this;
		api.post('/user/getUsers', {filter: filter}).then((res)=>{
			if(res.data && filter === this.state.filter){
				for(let i in res.data.users){
					res.data.users[i].addBtn = (
						<button onClick={()=>{this.requestFriend(res.data.users[i].id)}} className="AddBtn"> + </button>
					);
				}
				self.setState({users: res.data.users || []});
			}
		});
	}
	
	getFriendRequests(){
		let self = this;
		api.post('/user/getFriendRequests').then((res)=>{
			if(res.data){
				for(let i in res.data.friendRequests){
					res.data.friendRequests[i].acceptBtn = (
						<button onClick={()=>{this.acceptFriend(res.data.friendRequests[i].id)}} className="AcceptBtn">+</button>
					);
					res.data.friendRequests[i].denyBtn = (
						<button onClick={()=>{this.denyFriend(res.data.friendRequests[i].id)}} className="DenyBtn">-</button>
					);
				}
				self.setState({friendRequests: res.data.friendRequests || []});
			}
		});
	}
	
	render(){
		return (<div>
			{(this.state.friendRequests.length > 0)
				? <List title="Friend requests" data={this.state.friendRequests} fields={friendRequestFields}/>
				: <p> No friend requests pending </p>
			}
			
			<div>
				<h5> Search </h5>
				
				<input type="text" onChange={this.filterChangeHandler} placeholder="Search for Users" />
				
				{(this.state.users.length > 0)
					? <List data={this.state.users} fields={searchUserFields} key={this.state.filter}/>
					: <p> No users found </p>
				}
			</div>
		</div>);
	}
}

export default ContactsPage;
