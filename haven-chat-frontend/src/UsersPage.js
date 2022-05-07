import React from 'react';

import {api} from './util/api.js'
import SessionRequired from './component/SessionRequired.js'
import List from './component/List.js'

const searchUserFields = [{key: 'col1'}, {key: 'col2'}, {key: 'col4', header: 'Test4'}];
const data = [
	{col1: 'A1', col2: 'A2', col3: 'A3'},
	{col1: 'B1', col2: 'B2', col3: 'B3'},
	{col1: 'C1', col2: 'C2', col3: 'C3'}
]

class UsersPage extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			users: [],
			filter: ""
		}
		
		this.filterChangeHandler = this.filterChangeHandler.bind(this);
	}
	
	
	filterChangeHandler(e){
		const filter = e.target && e.target.value || "";
		let self = this;
		this.setState({filter: filter}, ()=>{
			self.getUsers(filter);
		});
	}
	
	getUsers(filter=""){
		let self = this;
		api.post('/users/getUsers', {filter: filter}).then((res)=>{
			if(res.data && res.data.users && filter === this.state.filter){
				self.setState({users: res.data.users || []});
			}
		});
	}
	
	render(){
		return (<div>
			<h2>Users</h2>
			
			<div>
				<h5> Search </h5>
				
				<input type="text" onChange={this.filterChangeHandler} placeholder="Search for Users" />
				
				{(this.state.users.length > 0)
					? <List data={this.state.users} fields={searchUserFields} key={this.state.filter}/>
					: <p> No users found </p>
				}
			</div>
			<SessionRequired />
		</div>);
	}
}

export default UsersPage;
