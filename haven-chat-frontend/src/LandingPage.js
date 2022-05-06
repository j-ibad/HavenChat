import logo from './logo.svg';
import './css/App.css';
import './css/LandingPage.css';
import {TabComponent, TabContent} from './TabComponent.js'

function LandingPage() {
  return (
    <div className="LandingPage">
		<header className="LandingPage-header">
			<img src={logo} className="LandingPage-logo" alt="logo" />
			<p> Welcome to HavenChat </p>
			<TabComponent style={{width: "70%", margin: "0 10%"}}>
				<TabContent label="Login"> <p> Login form </p> </TabContent> 
				<TabContent label="Register"> <p> Register form </p> </TabContent> 
			</TabComponent>
		</header>
    </div>
  );
}

export default LandingPage;