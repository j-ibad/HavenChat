import React from 'react';
import {Navigate, useLocation} from "react-router-dom";

import ChatSocket from '../util/ChatSocket.js'
import '../css/Notifications.css';


export default class ChatNotifications extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			invitations: [],
			redirectToChat: false
		}
		ChatSocket.setEventListener('request', this, this.receiveInvitation);
	}
	
	receiveInvitation(socket, self, data){
		let invitations = self.state.invitations.concat(data);
		self.setState({invitations});
	}
	
	accept(i){
		let invitations = this.state.invitations.slice();
		let acceptedInvitation = invitations.splice(i,1);
		this.setState({invitations});
		
		if(acceptedInvitation.length > 0){
			this.props.onAccept(acceptedInvitation[0]);
			this.setState({redirectToChat: true});
		}
	}
	
	deny(i){
		console.log(`Deny invitation from ${this.state.invitations[i].user.username}`);
		let invitations = this.state.invitations.slice();
		let deniedInvitation = invitations.splice(i,1);
		this.setState({invitations});
		
		console.log('TODO: PROPERLY DENY INVITATION');
	}
	
	render(){
		return (  <div>
			<ChatNotificationsUI 
				invitations={this.state.invitations} 
				key={this.state.invitations.length} 
				onAccept={(i)=>{this.accept(i);}}
				onDeny={(i)=>{this.deny(i);}} 
				redirectToChat={this.state.redirectToChat}
				key={this.state.redirectToChat}/>
				
			{this.state.redirectToChat && <RedirectToLiveChat />}
		</div> );
	}
}

function ChatNotificationsUI(props){
	return (  <div className="NotificationsContainer">
		{props.invitations.map((invite, i)=>{
			return (<div className="Notification ChatNotification" key={i}>
				<span> Received chat invitation from <b>{invite.user.username}</b>! </span>
				<button className="AcceptBtn" onClick={()=>{props.onAccept(i);}}> Accept </button>
				<button className="DenyBtn"onClick={()=>{props.onDeny(i);}}> Deny </button>
			</div>);
		})}
	</div> );
}

function RedirectToLiveChat(props){
	let location = useLocation();
	return (<div>
		{location.pathname !== '/livechat' && <Navigate to="/livechat" />}
	</div>);
}