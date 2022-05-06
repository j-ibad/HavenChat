import './css/App.css';
import './css/TabComponent.css';
import React from 'react'

class TabComponent extends React.Component {
	constructor(props){
		super(props);
		this.state = { content: this.props.children, active: 0 };
	}
	
	tabClickHandler(i){
		this.setState((prev)=>({content: prev.content, active: i}));
	}
	
	render(){
		return ( <div className="TabComponent" style={this.props.style}>
			<ul>{this.state.content.map((elem, i)=>{
				return ( <li key={i} onClick={()=>{this.tabClickHandler(i)}}>
					<div>{elem.props.label}</div> 
				</li> );
			})}</ul>
			
			<div className="TabContent">
				{this.state.content[ this.state.active ]}
			</div>
		</div>);
	}
}

function TabContent(props){
	return (<div> {props.children} </div>);
}

export {TabComponent, TabContent};