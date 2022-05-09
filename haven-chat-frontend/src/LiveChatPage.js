import React from 'react';
import forge from 'node-forge';

import {api} from './util/api.js'
import socket from './util/WebSocket.js'
import SessionRequired from './component/SessionRequired.js'
import List from './component/List.js'
import {Tab, TabContent} from './component/Tab.js';
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


export default class LiveChatPage extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			active: this.props.active || 0
		}
	}
	
	switchContent(i){ this.setState({active: i}); }
	
	render(){
		return(<div className="LiveChat">
			<Tab style={{width: '90%', margin: '1em 5%', border: 'none'}} noTab={true} active={this.state.active} key={this.state.active}>
				<TabContent label="SetupChat">
					<SetupChatPane onStartChat={()=>{this.switchContent(1)}}/>
				</TabContent> 
				<TabContent label="Chat"> 
					<ChatPane onBack={()=>{this.switchContent(0);}}/> 
				</TabContent> 
			</Tab>
			<SessionRequired />
		</div>);
	}
}


class SetupChatPane extends React.Component {
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
	
	componentDidMount(){ this.initData(); }
	
	initData(){ this.getActiveFriends(this.state.filter); }
	
	filterChangeHandler(e){
		const filter = (e.target && e.target.value) || "";
		let self = this;
		this.setState({filter: filter}, ()=>{
			self.getActiveFriends(filter);
		});
	}
	
	addParticipant(id){
		let nFriends = this.state.friends.slice();
		let nParticipants = this.state.participants.slice();
		let nKeyP = this.state.key + 1;
		let targetIndex = nFriends.findIndex((elem)=>{return elem.id === id});
		nParticipants.push( nFriends.splice(targetIndex, 1)[0] );
		this.setState({ friends: nFriends, participants: nParticipants, keyP: nKeyP });
	}
	
	getActiveFriends(filter=""){
		let self = this;
		api.post('/user/getActiveFriends', {filter: filter}).then((res)=>{
			if(res.data && filter === this.state.filter){
				let nFriends = res.data.friends;
				let participantIds = this.state.participants.map((elem)=>{return elem.id});
				self.setState({friends: nFriends.filter((elem)=>{ return !participantIds.includes(elem.id)}) || []});
			}
		});
	}
	
	render(){
		return (<div>
			<button onClick={this.props.onStartChat} disabled={(this.state.participants.length===0)}>
				Start Chat
			</button>
		
			{(this.state.participants.length > 0)
				? <List title="Participants" data={this.state.participants} fields={partipantFields} key={this.state.keyP}/>
				: <p> No chat participants </p>
			}
			
			
			<input type="text" onChange={this.filterChangeHandler} placeholder="Search for Active Friends" />
			
			{(this.state.friends.length > 0)
				? <List title="Friends" data={this.state.friends} fields={friendFields} key={this.state.filter} onRowClick={(id)=>{this.addParticipant(id)}}/>
				: <p> No active friends found </p>
			}
		</div>);
	}
}


class ChatPane extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			temp: "test"
		}
	}
	
	componentDidMount(){
		let ed25519 = forge.pki.ed25519;
		let keypair = ed25519.generateKeyPair();
		console.log(keypair);
	}
	
	render(){
		return (<div>
			<h3> Chat </h3>
			<button onClick={this.props.onBack}></button>
		</div>);
	}
}