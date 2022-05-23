//import forge from 'node-forge';
const forge = require('node-forge');
const isProbablePrime = require('./Prime.js').isProbablePrime;
const Lock = require('./Lock.js');
const BigInteger = require('jsbn').BigInteger;

const KEY_BIT_SIZE = 2048;

const BIGINT0 = new BigInteger('0');
const BIGINT1 = new BigInteger('1');
const BIGINT256 = new BigInteger('256');

class DSA {
	constructor(){}
	
	/**
	 * Generates public-key pair for DSA. If a key package is provided, then the key pair
	 * is generated with respect to the key package's Diffie-Hellman domain parameters
	 * (p,q,g). Otherwise, the domain parameters are generated.
	 * Uses BigInteger Arithmetic
	 */
	async init(keyPackage=null){
		console.log('GENERATING NEW PUBLIC KEY PAIR');
		if(keyPackage){
			this.p = new BigInteger(keyPackage.p.toString(36), 36);
			this.q = new BigInteger(keyPackage.q.toString(36), 36);
			this.g = new BigInteger(keyPackage.g.toString(36), 36);
		}else{
			// 1. Generate q 
			this.q = await this.generatePrime();
			
			// 2. Generate p, such that p-1 mod q = 0
			this.p = await this.primeModulus(this.q);
			
			// 3. Choose integer g (1<g<p) such that g = h**((p-1)/q) mod p-1
			let h = await this.generateRandom(this.q);
			this.g = h.modPow( this.p.subtract(BIGINT1).divide(this.q), this.p );
		}
		// 4. Generate private key pr, such that 0 < pr < q 
		this.pr = await this.generateRandom(this.q);
		
		// 5. Generate public key pu, such that pu = g**pr mod p
		this.pu = this.g.modPow(this.pr,this.p);
		
		return this.getKeyPackage();
	}
	
	/**
	 * Returns key package of the current DSA instance
	 * A key package contains the DH domain parameters, and the public key.
	 */
	getKeyPackage(){
		return {
			p: this.p.toString(36),
			q: this.q.toString(36),
			g: this.g.toString(36),
			pu: this.pu.toString(36)
		}
	}
	
	/**
	 * Signs a package using the current instance's private key and domain parameters.
	 * @param h - Hash digest
	 * @return {r, s}, the DSA digital signature
	 */
	async sign(h){
		let r = BIGINT0;
		let k = BIGINT0;
		let i = BIGINT0;
		let s = BIGINT0;
		while(s.compareTo(BIGINT0) === 0){
			while(r.compareTo(BIGINT0) === 0){
				// 1. Generate random integer k such that, 0 < k < q;
				k = await this.generatePrime(this.q);
				
				// 2. r = (g**k mod p) mod q. (If r = 0, select diff k)
				r = this.g.modPow(k, this.p).mod(this.q);
			}
			// 3. Compute i, such that k*i mod q = 1
			i = this.modularInverse(k, this.q);
			
			// 4. s = i*(h+r*pr) mod q. (If s = 0, select diff k)
			s = i.multiply(h.add(r.multiply(this.pr))).mod(this.q);
		}
		// 5. Return signature {r, s}
		return {r: r.toString(36),s: s.toString(36)};  // Stringified for transport
	}
	
	
	/**
	 * Verifies a given signature using a provided public key. Public key must be
	 * of the same domain parameters as the current DSA instance.
	 * @param h - Hash digest
	 * @param pu - Public key
	 * @param {r, s} - DSA Signature
	 * @return true if verified, false otherwise
	 */
	verify(h, pu, {r, s}){
		pu = new BigInteger(pu.toString(36), 36);
		r = new BigInteger(r.toString(36), 36);
		s = new BigInteger(s.toString(36), 36);
		// Check if in valid range
		if(r.compareTo(BIGINT0) <= 0 || r.compareTo(this.q) >= 0 || s.compareTo(BIGINT0) <= 0 || s.compareTo(this.q) >= 0){
			return false;
		}
		
		// 1. Compute w, such that s*w mod q = 1
		let w = this.modularInverse(s, this.q);
		
		// 2. Calculate u1, u1 = h*w mod q
		let u1 = h.multiply(w).mod(this.q);
		
		// 3. Calculate u2, u2 = r*w mod q
		let u2 = r.multiply(w).mod(this.q);
		
		// 4. Calculate v = [((g**u1) * (pu**u2) mod p) mod q]
		let v = (this.g.modPow(u1, this.p).multiply(pu.modPow(u2, this.p))).mod(this.p).mod(this.q);
		
		return v.compareTo(r) === 0;
	}
	
	
	/**
	 * Generates a random prime number of KEY_BIT_SIZE maximum. If an upper_limit
	 * is provided, then only prime numbers lower than the upper_limit are generated.
	 * Uses BigInteger arithmetics
	 * @param upper_limit? - Largest number that prime number generated could. Defaults 
	 * 	to 2^KEY_BIT_SIZE - 1
	 * @return q, such that q is prime and 1 < q < upper_limit
	 */
	async generatePrime(upper_limit=BIGINT0){
		let lock = new Lock();
		let res = new BigInteger('0');
		let hasUpperLimit = (upper_limit.compareTo(BIGINT0) !== 0);
		let res_bitlength = (hasUpperLimit) ? upper_limit.bitLength() : KEY_BIT_SIZE;
		while((hasUpperLimit && res.compareTo(upper_limit) >= 0) || res.compareTo(BIGINT0) === 0){
			lock.lock();
			forge.prime.generateProbablePrime(res_bitlength/2, (err, num)=>{
				if(!err){
					res = new BigInteger(num.toString());
				}
				lock.unlock();
			});
			await lock.wait();
		}
		return res;
	}
	
	/**
	 * Translates a Byte array into a BigInteger
	 * Uses BigInteger Arithmetic
	 * @param bytes - Byte Array to be convertes
	 * @return Big Integer representation of byte array
	 */
	bytesToBigInteger(bytes){
		let retVal = BIGINT0;
		let mult = BIGINT1;
		for(let byte of bytes){
			retVal = retVal.add(new BigInteger(byte.charCodeAt(0).toString()).multiply(mult));
			mult = mult.multiply(BIGINT256);
		}
		return retVal;
	}
	
	/**
	 * Generates a random integer less than the upper_limit.
	 * Upper_limit max at 2^(KEY_BIT_SIZE) - 1
	 * Uses BigInteger Arithmetic
	 * @param upper_limit - Upper bounds of random integer generated
	 * @return random integer i, such that 0 < i < upper_limit
	 */
	generateRandom(upper_limit){
		let arr = forge.random.getBytesSync(KEY_BIT_SIZE/8);
		return this.bytesToBigInteger(arr).mod(upper_limit);
	}
	
	/**
	 * Finds the modular inverse i, of k, relative to  q.
	 * Uses BigInteger Arithmetic
	 * @param k - Number whose modular inverse is to be obtained
	 * @param q - Number relative to which i is a modular inverse of k
	 * @return i, such that k*i mod q = 1
	 */
	modularInverse(k, q){
		let i = this.extEuclid(k, q).s;
		if(i.compareTo(BIGINT0) < 0){
			i = q.add(i);
		}
		
		if(k.multiply(i).mod(q).compareTo(BIGINT1) !== 0){
			i = BIGINT0;
		}
		return i;
	}
	
	// Extended Euclidean Algorithm. Helper function for finding modular inverse
	extEuclid(a, b){
		if(b.compareTo(BIGINT0) === 0) return {d: a, s: BIGINT1, t: BIGINT0};
		
		let {d, s, t} = this.extEuclid(b, a.mod(b));
		let d1 = d;
		let s1 = t;
		let t1 = s.subtract(a.divide(b).multiply(t));
		return {d: d1, s: s1, t: t1};
	}
	
	
	/**
	 * Obtains the prime modulus p, of q, such that p is prime and p-1 mod q = 0
	 * Uses BigInteger arithmetics
	 * @param q - Prime number q whose prime modulus to find
	 * @return p, such that p-1 mod q = 0
	 */
	primeModulus(q){
		let p = q.add(BIGINT1);
		while(!isProbablePrime(p)){
			p = p.add(q);
		}
		return p;
	}
}



module.exports = DSA;