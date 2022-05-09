import React from 'react'

import '../css/List.css';

const defaultOnRowClick = (i)=>{};

class List extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			onRowClick: this.props.onRowClick || defaultOnRowClick
		}
	}
	
	//Add a key to root to reflect changes to props
	render(){
		let self = this;
		return ( <div className="List">
			{self.props.title && <h4> {self.props.title} </h4>}
			<table>
				{self.props.fields[0].header && <thead><tr>
					{self.props.fields.map((field, j)=>{
						return (<th key={j}>
							{field.header || ""}
						</th>);
					})}
				</tr></thead>}
			
				<tbody>{self.props.data.map((row, i)=>{
					return (<tr key={i} onClick={()=>{self.state.onRowClick(i)}}>
					
						{self.props.fields.map((field, j)=>{
							return (<td key={j}>
								{row[field.key] || ""}
							</td>);
						})}
						
					</tr>);
				})}</tbody>
			</table>
		</div>);
	}
}

export default List;
