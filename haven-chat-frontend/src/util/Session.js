import Cookies from 'universal-cookie';
const cookies = new Cookies();

class Session {
	constructor(){
		this.cookies = cookies;
	}
	
	getSession(){
		return this.cookies.get("havenchat_session") || null;
	}
}

const SessionInstance = new Session();
export default SessionInstance;


