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
				sid: 0,
				signMethod: 0
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
			keyP: 0,
			value: ''
		};

		this.filterChangeHandler = this.filterChangeHandler.bind(this);
		this.startChat = this.startChat.bind(this);
		this.handleChange = this.handleChange.bind(this);
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
			participants: this.state.participants,
			signMethod: this.state.value
		});
	}

	handleChange(event){
		this.setState({value: event.target.value});
	}
	render(){
		return (<div>
			<button onClick={this.startChat} disabled={(this.state.participants.length===0)}>
				Start Chat
			</button>


			<form onSubmit={this.handleSubmit}>
				<label>
				Pick Your Type of Digital Signature:  
				<select value={this.state.value} onChange={this.handleChange}>
					<option value = "0"> RSA </option>
					<option value = "1"> DSA </option>
				</select>
				</label>
			</form>
		
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
			console.log(chatConfig);
			ChatSocket.signMethod = chatConfig.signMethod || 0;
			ChatSocket.accept(chatConfig.sid);
		}
		
		this.state = {
			msg: "",
			msgHistory: []
		}
		this.msgInputHandler = this.msgInputHandler.bind(this);
		this.rcvMsg = this.rcvMsg.bind(this);
		this.sendMsg = this.sendMsg.bind(this);
		this.participantJoined = this.participantJoined.bind(this);
		this.participantLeft = this.participantLeft.bind(this);
		ChatSocket.setEventListener('send', this, this.rcvMsg);
		ChatSocket.setEventListener('accept', this, this.participantJoined);
		ChatSocket.setEventListener('close', this, this.participantLeft);
	}
	
	componentWillUnmount(){
		this.close();
	}
	
	msgInputHandler(e){ this.setState({msg: e.target.value}); }
	
	pushMessage(msg, from=null, verified=true){
		let msgHistory = this.state.msgHistory.slice();
		let now = new Date();
		now = now.toISOString().split('T')[0]
		msgHistory.push({msg, from, time: now, verified: verified});
		this.setState({msg: "", msgHistory});
	}
	
	sendMsg(){
		ChatSocket.send(this.state.msg);
		this.pushMessage(this.state.msg, Session.getSession());
	}
	
	rcvMsg(socket, self, msgObj){
		this.pushMessage(msgObj.msg, msgObj.from, msgObj.verified); 
	}
	
	participantJoined(socket, self, user){
		this.pushMessage(`${user.username} has joined the chat`);
	}
	
	participantLeft(socket, self, data){
		if(data.active === 0){ 
			this.pushMessage(`${data.user.username} has rejected your chat request`);
		}else{
			this.pushMessage(`${data.user.username} has left the chat`);
		}
	}
	
	close(){
		ChatSocket.close();
		ChatSocket.deleteEventListener('send');
		ChatSocket.deleteEventListener('accept');
		ChatSocket.deleteEventListener('close');
	}
	
	render(){
		return (<div>
			<button onClick={()=>{this.props.onBack(); this.close();}}>Back</button>
			<div className="MessagesWrapper">
				<div className="MessagesPaneWrapper">
					<div className="MessagesPane">
						{this.state.msgHistory.slice().reverse().map((entry, i)=>{
							let msgType = (entry.from === null) 
								? 'System'
								: ((entry.from.id === Session.getSession().id) ? 'To' : 'From');
							
							return (<div key={i} className={`Message ${msgType}`}>
								<p className="Msg"> {entry.msg} </p>
								{(entry.verified && "Verified :)") || "NOT VERIFIED :("}
								<p className="Time">
									{entry.time} 
									{entry.from && <i>-- [<b>{entry.from.username}</b>]</i>}
								</p>
							</div>);
						})}
					</div>
				</div>
				
				<div className="MessageInput">
					<input type="text" 
						value={this.state.msg} 
						onChange={this.msgInputHandler}
						placeholder="Aa"/>
					<button className="Send"
						disabled={this.state.msg.trim().length===0}
						onClick={this.sendMsg}>
						Send
					</button>
				</div>
			</div>
		</div>);
	}
}