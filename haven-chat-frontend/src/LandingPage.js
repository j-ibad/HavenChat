import logo from './logo.svg';
import './css/App.css';
import './css/LandingPage.css';

function LandingPage() {
  return (
    <div className="LandingPage">
      <header className="LandingPage-header">
        <img src={logo} className="LandingPage-logo" alt="logo" />
        <p>
			Welcome to HavenChat
        </p>
      </header>
    </div>
  );
}

export default LandingPage;