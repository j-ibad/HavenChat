import React from 'react';
import {Navigate} from "react-router-dom";

import logo from './logo.svg';
import './css/App.css';
import './css/LandingPage.css';
import {TabComponent, TabContent} from './TabComponent.js';
import {api} from './util/api.js'


class LandingPage extends React.Component{
	render(){
		return ( <div className="LandingPage">
			<header className="LandingPage-header">
				<img src={logo} className="LandingPage-logo" alt="logo" />
				<p> Welcome to HavenChat </p>
				<TabComponent style={{width: "70%", margin: "0 10%"}}>
					<TabContent label="Login"> <LoginForm onLogin={this.props.onLogin}/> </TabContent> 
					<TabContent label="Register"> <RegistrationForm /> </TabContent> 
				</TabComponent>
			</header>
		</div> );
	}
}


class LoginForm extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			form: {username: "", password: ""},
			status: null, 
			msg: '',
			loading: false,
			login: false
		};
		
		this.submitHandler = this.submitHandler.bind(this);
		this.changeHandler = this.changeHandler.bind(this);
	}
	
	submitHandler(e){
		e.preventDefault();
		if(this.state.loading) return;
		this.setState({ loading: true, status: null });
		api.post('/auth/login', this.state.form).then((res)=>{
			this.setState({ status: res.data.status, msg: res.data.msg });
			if(res.data.status){
				this.props.onLogin();
				this.setState({ login: true });
			}
		}).catch().then(()=>{
			this.setState({ loading: false });
		});
	}
	
	changeHandler(e){
		const target = e.target;
		const val = target.type === 'checkbox' ? target.checked : target.value;
		this.setState(prevState=>{
			let form = Object.assign({}, prevState.form);
			form[target.name] = val;
			return {form};
		});
	}
	
	render(){
		return ( <div className="Form">
			<h3> Login </h3>
			
			<span className={`FormPrompt ${(this.state.status === null) ? 'None' : ((this.state.status) ? "Success" : "Error")}`}>
				{this.state.msg} 
			</span>
			
			<form onSubmit={this.submitHandler}>
				<input type="text" name="username" value={this.state.form.username} onChange={this.changeHandler} placeholder="Username" required autoComplete="username"/>
				<input type="password" name="password" value={this.state.form.password} onChange={this.changeHandler} placeholder="Password" required autoComplete="current-password"/>
				<button type="submit" className={(this.state.loading) ? 'Loading' : ''}> 
					{(this.state.loading) ? 'Logging In' : 'Log In'} 
				</button>
			</form>
			
			{this.state.login && <Navigate to="/home"/>}
		</div> );
	}
}


class RegistrationForm extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			form: {
				fName: "", lName: "",
				email: "",
				username: "", 
				password: ""
			},
			status: null,
			msg: '',
			loading: false
		};
		
		this.submitHandler = this.submitHandler.bind(this);
		this.changeHandler = this.changeHandler.bind(this);
	}
	
	submitHandler(e){
		e.preventDefault();
		if(this.state.loading) return;
		this.setState({ loading: true, status: null });
		api.post('/auth/register', this.state.form).then((res)=>{
			this.setState({ status: res.data.status, msg: res.data.msg });
		}).catch().then(()=>{
			this.setState({ loading: false });
		});
	}
	
	changeHandler(e){
		const target = e.target;
		const val = target.type === 'checkbox' ? target.checked : target.value;
		this.setState(prevState=>{
			let form = Object.assign({}, prevState.form);
			form[target.name] = val;
			return {form};
		});
	}
	
	render(){
		return ( <div className="Form">
			<h3> Register </h3>
			
			<span className={`FormPrompt ${(this.state.status === null) ? 'None' : ((this.state.status) ? "Success" : "Error")}`}>
				{this.state.msg} 
			</span>
			
			<form onSubmit={this.submitHandler}>
				<input type="text" name="fName" value={this.state.form.fName} onChange={this.changeHandler} placeholder="First Name" required/>
				<input type="text" name="lName" value={this.state.form.lName} onChange={this.changeHandler} placeholder="Last Name" required/>
				<input type="email" name="email" value={this.state.form.email} onChange={this.changeHandler} placeholder="Email" required/>
				<input type="text" name="username" value={this.state.form.username} onChange={this.changeHandler} placeholder="Username" required autoComplete="username"/>
				<input type="password" name="password" value={this.state.form.password} onChange={this.changeHandler} placeholder="Password" required autoComplete="new-password"/>
				<button type="submit" className={(this.state.loading) ? 'Loading' : ''}> 
					{(this.state.loading) ? 'Registering' : 'Register'} 
				</button>
			</form>
		</div> );
	}
}


export default LandingPage;