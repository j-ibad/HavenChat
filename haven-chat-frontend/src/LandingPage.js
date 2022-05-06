import logo from './logo.svg';
import './css/App.css';
import './css/LandingPage.css';
import {TabComponent, TabContent} from './TabComponent.js';
import React from 'react';

function LandingPage() {
  return (
    <div className="LandingPage">
		<header className="LandingPage-header">
			<img src={logo} className="LandingPage-logo" alt="logo" />
			<p> Welcome to HavenChat </p>
			<TabComponent style={{width: "70%", margin: "0 10%"}}>
				<TabContent label="Login"> <LoginForm /> </TabContent> 
				<TabContent label="Register"> <RegistrationForm /> </TabContent> 
			</TabComponent>
		</header>
    </div>
  );
}


class LoginForm extends React.Component{
	constructor(props){
		super(props);
		this.state = {username: "", password: ""};
		
		this.submitHandler = this.submitHandler.bind(this);
		this.changeHandler = this.changeHandler.bind(this);
	}
	
	submitHandler(e){
		e.preventDefault();
		console.log(this.state);
		// TODO -- Login
	}
	
	changeHandler(e){
		const target = e.target;
		const val = target.type === 'checkbox' ? target.checked : target.value;
		this.setState({ [target.name]: val });
	}
	
	render(){
		return ( <div className="Form">
			<h3> Login </h3>
			
			<form onSubmit={this.submitHandler}>
				<input type="text" name="username" value={this.state.username} onChange={this.changeHandler} placeholder="Username"/>
				<input type="password" name="password" value={this.state.password} onChange={this.changeHandler} placeholder="Password"/>
				<button type="submit"> Log In </button>
			</form>
		</div> );
	}
}


class RegistrationForm extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			fName: "",
			lName: "",
			email: "",
			
			username: "",
			password: ""
		};
		
		this.submitHandler = this.submitHandler.bind(this);
		this.changeHandler = this.changeHandler.bind(this);
	}
	
	submitHandler(e){
		e.preventDefault();
		console.log(this.state);
		// TODO -- Register
	}
	
	changeHandler(e){
		const target = e.target;
		const val = target.type === 'checkbox' ? target.checked : target.value;
		this.setState({ [target.name]: val });
	}
	
	render(){
		return ( <div className="Form">
			<h3> Register </h3>
			
			<form onSubmit={this.submitHandler}>
				<input type="text" name="fName" value={this.state.fName} onChange={this.changeHandler} placeholder="First Name"/>
				<input type="text" name="lName" value={this.state.lName} onChange={this.changeHandler} placeholder="Last Name"/>
				<input type="email" name="email" value={this.state.email} onChange={this.changeHandler} placeholder="Email"/>
				<input type="text" name="username" value={this.state.username} onChange={this.changeHandler} placeholder="Username"/>
				<input type="password" name="password" value={this.state.password} onChange={this.changeHandler} placeholder="Password"/>
				<button type="submit"> Register </button>
			</form>
		</div> );
	}
}


export default LandingPage;