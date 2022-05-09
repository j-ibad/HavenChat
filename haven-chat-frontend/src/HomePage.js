import React from 'react';

import SessionRequired from './component/SessionRequired.js'

export default class HomePage extends React.Component {
	render(){
		return (<div style={{width: '90%', margin: '1em 5%'}}>
			<h2>Home</h2>
			<SessionRequired />
		</div>);
	}
}