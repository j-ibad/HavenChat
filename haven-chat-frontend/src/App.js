import React from 'react';
import {BrowserRouter as Router, Routes as Switch, Route, Link, Navigate} from "react-router-dom";

import {api} from './util/api.js'
import Session from './util/Session.js'
import Socket from './util/WebSocket.js'

import './css/App_Nav.css';
import ChatNotifications from "./component/ChatNotifications.js"
import LandingPage from "./LandingPage.js"
import HomePage from "./HomePage.js"
import AboutPage from "./AboutPage.js"
import ContactsPage from "./ContactsPage.js"
import LiveChatPage from "./LiveChatPage.js"

export default class App extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			session: Session.getSession(),
			loggingOut: true,
			invite: null,
			inviteKey: '',
			login: 0
		};
		
		this.refreshCookie = this.refreshCookie.bind(this);
		this.logout = this.logout.bind(this);
	}

	componentDidMount(){
		Socket.connect();
	}
	
	refreshCookie(){
		this.setState({
			session: Session.getSession()
		});
	}
	
	logout(child){
		this.setState({loggingOut: true});
		api.post('/auth/logout').then(()=>{
			this.refreshCookie();
		}).catch().then(()=>{
			this.setState({loggingOut: false});
			child.setState({loggedOut: true});
			Socket.close();
		});
	}
	
	acceptChat(invite){
		this.setState({invite, inviteKey: invite.sid});
	}
  
	render(){
		return ( <Router> <div>
			<nav id="HC-Nav"> <ul>
				{!this.state.session && <li> <Link to="/about">About</Link> </li>}
				
				{this.state.session && <li> <Link to="/home">Home</Link> </li>}
				{this.state.session && <li> <Link to="/livechat">Live Chat</Link> </li>}
				{this.state.session && <li> <Link to="/contacts">Contacts</Link> </li>}
				
				
				{this.state.session && <li className="LoggedIn"> Logged in as <b>{this.state.session.username}</b> </li>}
				{this.state.session && <li className="Logout"> <Link to="/logout"> Logout </Link> </li>}
				{!this.state.session && <li className="Login"> 
					<Link to="/" onClick={()=>{this.setState({login: 0})}}> Login </Link>
				</li>}
				{!this.state.session && <li className="Login">
					<Link to="/" onClick={()=>{this.setState({login: 1})}}> Sign-Up </Link>
				</li>}
			</ul> </nav>

			<Switch>
			  <Route path="/" element={
				  <LandingPage onLogin={this.refreshCookie} session={this.state.session}
					login={this.state.login} key={this.state.login}/>}>
			  </Route>
			  <Route path="/home" element={<HomePage />}> </Route>
			  <Route path="/about" element={<AboutPage />}> </Route>
			  <Route path="/contacts" element={<ContactsPage />}> </Route>
			  <Route path="/livechat" element={<LiveChatPage invite={this.state.invite} key={this.state.inviteKey}/>}> </Route>
			  <Route path="/logout" element={<Logout onLogout={this.logout}/>}> </Route>
			</Switch>
			
			<ChatNotifications onAccept={(obj)=>{this.acceptChat(obj);}}/>
		</div> </Router> );
	}
}


class Logout extends React.Component {
	constructor(props){
		super(props);
		this.state = { loggedOut: false }
	}
	
	componentDidMount(){ this.props.onLogout(this); }
	
	render(){
		return (  <div>
			{this.state.loggedOut
				? <Navigate to="/" />
				: <p> Logging out ... </p> }
		</div> );
	}
}