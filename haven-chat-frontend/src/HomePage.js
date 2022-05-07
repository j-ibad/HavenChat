import React from 'react';

import SessionRequired from './component/SessionRequired.js'

class HomePage extends React.Component {
	render(){
		return (<div>
			<h2>Home</h2>
			<SessionRequired />
		</div>);
	}
}

export default HomePage;
