import axios from 'axios';

const api_port = 18070;
const api_baseURL = ((process.env.NODE_ENV || '').trim() === 'development') ? 'http://localhost' : 'https://havenchat.ibad.one';

const api = axios.create({
	baseURL: `${api_baseURL}:${api_port}/api/`
});

export {api}