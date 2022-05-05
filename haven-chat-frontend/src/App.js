import {BrowserRouter as Router, Routes as Switch, Route, Link} from "react-router-dom";
import './css/App_Nav.css';
import LandingPage from "./LandingPage.js"

function App() {
  return ( <Router> <div>
		<nav id="HC-Nav"> <ul>
			<li> <Link to="/">Home</Link> </li>
			<li> <Link to="/about">About</Link> </li>
			<li> <Link to="/users">Users</Link> </li>
		</ul> </nav>

		<Switch>
		  <Route path="/" element={<LandingPage />}> </Route>
		  <Route path="/about" element={<About />}> </Route>
		  <Route path="/users" element={<Users />}> </Route>
		</Switch>
	</div> </Router> );
}

function About() {
  return <h2>About</h2>;
}

function Users() {
  return <h2>Users</h2>;
}

export default App;
