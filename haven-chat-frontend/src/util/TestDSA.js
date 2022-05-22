const DSA = require('./DSA.js');
const forge = require('node-forge');

async function main(){
	let msg = "I love Winnie Pan <3";
	let md1 = await forge.md.sha1.create();
	await md1.update(msg, 'utf8');
	
	console.log('\nConfiguring user 1');
	let user1 = new DSA();
	let h1 = user1.bytesToBigInteger(md1.digest().getBytes());
	await user1.init();
	
	console.log('\nConfiguring user 2');
	let keyPkg1 = user1.getKeyPackage();
	console.log(`keyPkg: ${JSON.stringify(keyPkg1)}`);
	let user2 = new DSA();
	await user2.init(keyPkg1);
	
	console.log('\nSigning Message');
	console.log(`hash1: ${h1}`);
	let sign1 = await user1.sign(h1);
	console.log(`sign1: ${JSON.stringify(sign1)}`);
	
	
	console.log('\nVerifying Message');
	let verificationAuthentic = await user2.verify(h1, keyPkg1.pu, sign1);
	console.log(`Verification of authentic message: ${verificationAuthentic}`);
	
	
	
	let darth_msg = "Josh is Bad >:-(";
	let darth_md = await forge.md.sha1.create();
	await darth_md.update(darth_msg, 'utf8');
	let darth_hash = user1.bytesToBigInteger(darth_md.digest().getBytes());
	
	
	console.log('\nVerifying Message');
	let verificationAttacker = await user2.verify(darth_hash, keyPkg1.pu, sign1);
	console.log(`Verification of darth's modified message: ${verificationAttacker}`);
}
main();
