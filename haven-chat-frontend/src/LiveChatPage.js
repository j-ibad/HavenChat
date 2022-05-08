import React from 'react';

import {api} from './util/api.js'
import SessionRequired from './component/SessionRequired.js'
import List from './component/List.js'
import './css/LiveChat.css';

const friendFields = [
	{key: 'username', header: 'Username'},
	{key: 'firstName', header: 'First Name'},
	{key: 'lastName', header: 'Last Name'}
]


class LiveChatPage extends React.Component {
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
		this.getActiveFriends(this.state.filter);
	}
	
	
	filterChangeHandler(e){
		const filter = (e.target && e.target.value) || "";
		let self = this;
		this.setState({filter: filter}, ()=>{
			self.getActiveFriends(filter);
		});
	}
	
	getActiveFriends(filter=""){
		let self = this;
		api.post('/user/getActiveFriends', {filter: filter}).then((res)=>{
			if(res.data && filter === this.state.filter){
				self.setState({friends: res.data.friends || []});
			}
		});
	}
	
	render(){
		return (<div>
			<input type="text" onChange={this.filterChangeHandler} placeholder="Search for Active Friends" />
			
			{(this.state.friends.length > 0)
				? <List title="Friends" data={this.state.friends} fields={friendFields} key={this.state.filter}/>
				: <p> No active friends found </p>
			}
			
			<SessionRequired />
		</div>);
	}
}


export default LiveChatPage;
