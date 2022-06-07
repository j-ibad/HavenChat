export default function AboutPage(){
	return (<div style={{"padding": "2em"}}>
		<h1> About </h1>
		<h2> By: Winnie Pan & Josh Ibad </h2>
		<p> HavenChat is a Web Application that provides a Secure Live Chatting service. Users may register and befriend others with whom they may then chat with, through a custom message exchange protocol that provides Confidentiality, Authentication, Digital Signature & Integrity. Specifically, the chat is encrypted symmetrically using 256-bit AES in CBC mode, with the chat session key being distributed to each user using asymmetric encryption via RSA. Authentication is provided through the login system, with passwords hashed using BCrypt, and with a server signed JWT token using HS512. Finally, Digital Signature & Integrity is provided using the user’s choice of either RSA or DSA signing, both of which are supported by the SHA256 hashing algorithm, with signature verification taking place on the client-side, to verify that the right person sent the message unmodified. The RSA/DSA public key for signatures are stored by the server for the duration of the session, and are distributed to all participants of the chat, acting as a Public Key Authority. All symmetric and asymmetric keys are temporary to a single chat session, which are cleared when all participants have left. </p>
		<p> HavenChat was built using ReactJS, Express, NodeJS, and MySQL, ran on a Linux box. WebSockets are used to host live chat traffic, with encryption predominantly implemented using the Node-forge library. DSA was implemented personally using helper prime functions from node-forge. The Bcrypt and jsonwebtoken libraries support authentication. </p>
		<object data={"https://ibad.one/pdf/havenchat_project_report.pdf"} type={"application/pdf"} style={{width: "100%", height: "100vh"}}>
        <div>No online PDF viewer installed. Please visit <a href={"https://ibad.one/pdf/havenchat_project_report.pdf"}>here</a></div>
    </object>
	</div>);
}