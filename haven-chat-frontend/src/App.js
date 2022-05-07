import React from 'react';
import Cookies from 'universal-cookie';
import {BrowserRouter as Router, Routes as Switch, Route, Link, Navigate} from "react-router-dom";

import './css/App_Nav.css';
import LandingPage from "./LandingPage.js"
import {api} from './util/api.js'

const cookies = new Cookies();

class App extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			session: cookies.get("havenchat_session") || null,
			loggingOut: true
		};
		
		this.refreshCookie = this.refreshCookie.bind(this);
		this.logout = this.logout.bind(this);
	}
	
	refreshCookie(){
		this.setState({
			session: cookies.get("havenchat_session") || null
		});
	}
	
	logout(child){
		this.setState({loggingOut: true});
		api.post('/auth/logout').then(()=>{
			this.refreshCookie();
		}).catch().then(()=>{
			this.setState({loggingOut: false});
			child.setState({loggedOut: true});
		});
	}
  
	render(){
		return ( <Router> <div>
			<nav id="HC-Nav"> <ul>
				<li> <Link to="/home">Home</Link> </li>
				{this.state.session && <li> <Link to="/about">About</Link> </li>}
				{this.state.session && <li> <Link to="/users">Users</Link> </li>}
				
				
				{this.state.session && <li className="LoggedIn"> Logged in as {this.state.session.username} </li>}
				{this.state.session && <li className="Logout"> <Link to="/logout"> Logout </Link> </li>}
				{!this.state.session && <li className="Login"> <Link to="/"> Login | Sign-Up </Link> </li>}
			</ul> </nav>

			<Switch>
			  <Route path="/" element={<LandingPage onLogin={this.refreshCookie} session={this.state.session}/>}> </Route>
			  <Route path="/home" element={<Home />}> </Route>
			  <Route path="/about" element={<About />}> </Route>
			  <Route path="/users" element={<Users />}> </Route>
			  <Route path="/logout" element={<Logout onLogout={this.logout}/>}> </Route>
			</Switch>
		</div> </Router> );
	}
}

class Logout extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			loggedOut: false
		}
		this.props.onLogout(this);
	}
	
	render(){
		return ( 
			<div>
				{this.state.loggedOut}
				{this.state.loggedOut
					? <Navigate to="/" />
					: <p> Logging out ... </p>
				}
			</div>
		);
	}	
}

function About() {
  return <h2>About</h2>;
}

function Users() {
  return <h2>Users</h2>;
}

function Home() {
  return <h2>Home</h2>;
}

export default App;
