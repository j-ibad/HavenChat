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

const partipantFields = [
	{key: 'username', header: 'Username'},
	{key: 'firstName', header: 'First Name'},
	{key: 'lastName', header: 'Last Name'},
	{key: 'removeBtn', header: ''}
]

class LiveChatPage extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			participants: [],
			friends: [],
			filter: "",
			keyP: 0
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
	
	addParticipant(id){
		console.log(id);
		let nFriends = this.state.friends.slice();
		let nParticipants = this.state.participants.slice();
		let targetIndex = nFriends.findIndex((elem)=>{return elem.id === id});
		nParticipants.push( nFriends.splice(targetIndex, 1)[0] );
		
		this.setState(prevState=>{
			return { friends: nFriends, participants: nParticipants, keyP: prevState.keyP+1 };
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
			
			{(this.state.participants.length > 0)
				? <List title="Participants" data={this.state.participants} fields={partipantFields} key={this.state.keyP}/>
				: <p> No chat participants </p>
			}
			
			
			<input type="text" onChange={this.filterChangeHandler} placeholder="Search for Active Friends" />
			
			{(this.state.friends.length > 0)
				? <List title="Friends" data={this.state.friends} fields={friendFields} key={this.state.filter} onRowClick={(id)=>{this.addParticipant(id)}}/>
				: <p> No active friends found </p>
			}
			
			<SessionRequired />
		</div>);
	}
}


export default LiveChatPage;
