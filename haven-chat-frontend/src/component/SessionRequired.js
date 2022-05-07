import React from 'react';
import {Navigate} from "react-router-dom";

import Session from '../util/Session.js'


class SessionRequired extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			session: Session.getSession()
		};
	}
	
	render(){
		return (  <div>
			{(!this.state.session) && <Navigate to="/" />}
		</div> );
	}	
}


export default SessionRequired;