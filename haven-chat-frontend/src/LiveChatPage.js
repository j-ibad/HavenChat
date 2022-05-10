import React from 'react';

import {api} from './util/api.js'
import ChatSocket from './util/ChatSocket.js'
import Session from './util/Session.js'
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
			active: (this.props.invite && 1) || 0,
			chatConfig: this.props.invite || {
				participants: [],
				sid: 0
			}
		}
	}
	
	switchContent(i){ this.setState({active: i}); }
	setupChat(chatConfig){
		this.setState({chatConfig: Object.assign(chatConfig, {sid: 0})});
		this.switchContent(1);
	}
	
	render(){
		return(<div className="LiveChat">
			<Tab style={{width: '90%', margin: '1em 5%', border: 'none'}} noTab={true} active={this.state.active} key={this.state.active}>
				<TabContent label="SetupChat">
					<SetupChatPane onStartChat={(obj)=>{this.setupChat(obj)}}/>
				</TabContent> 
				<TabContent label="Chat"> 
					<ChatPane onBack={()=>{this.switchContent(0);}} chatConfig={this.state.chatConfig}/> 
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
		this.startChat = this.startChat.bind(this);
	}
	
	componentDidMount(){ this.initData(); }
	
	initData(){ this.getActiveFriends(this.state.filter); }
	
	filterChangeHandler(e){
		const filter = (e.target && e.target.value) || "";
		let self = this;
		this.setState({filter}, ()=>{
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
		api.post('/user/getActiveFriends', {filter}).then((res)=>{
			if(res.data && filter === this.state.filter){
				let nFriends = res.data.friends;
				let participantIds = this.state.participants.map((elem)=>{return elem.id});
				self.setState({friends: (nFriends || []).filter((elem)=>{ return !participantIds.includes(elem.id)}) || []});
			}
		});
	}
	
	startChat(){
		this.props.onStartChat({
			participants: this.state.participants
		});
	}
	
	render(){
		return (<div>
			<button onClick={this.startChat} disabled={(this.state.participants.length===0)}>
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
		let chatConfig = this.props.chatConfig;
		if(chatConfig.sid === 0){
			ChatSocket.request({participants: chatConfig.participants});
		}else{
			ChatSocket.accept(chatConfig.sid);
		}
		
		this.state = {
			msg: "",
			msgHistory: []
		}
		this.msgInputHandler = this.msgInputHandler.bind(this);
		this.rcvMsg = this.rcvMsg.bind(this);
		this.sendMsg = this.sendMsg.bind(this);
		ChatSocket.setEventListener('send', this, this.rcvMsg);
	}
	
	componentWillUnmount(){
		console.log('Unmount');
		ChatSocket.deleteEventListener('send');
	}
	
	
	msgInputHandler(e){ this.setState({msg: e.target.value}); }
	sendMsg(){
		ChatSocket.send(this.state.msg);
		let msgHistory = this.state.msgHistory.slice();
		msgHistory.push({msg: this.state.msg, from: Session.getSession()});
		this.setState({msg: "", msgHistory});
	}
	rcvMsg(socket, self, msgObj){
		let msgHistory = self.state.msgHistory.slice();
		msgHistory.push(msgObj);
		self.setState({msgHistory});
	}
	
	render(){
		return (<div>
			<button onClick={this.props.onBack}>Back</button>
			<h3> Chat </h3>
			<input type="text" 
				value={this.state.msg} 
				onChange={this.msgInputHandler}/>
			<button 
				disabled={this.state.msg.trim().length===0}
				onClick={this.sendMsg}>
				Send
			</button>
			
			{this.state.msgHistory.map((entry, i)=>{
				return (<div key={i}>
					<p> From: {entry.from.username} </p>
					<p> {entry.msg} </p>
				</div>);
			})}
		</div>);
	}
}