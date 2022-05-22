/**
 * RSA Key Generation Worker.
 * Credits to Dave Longley, author of node-forge, for the following Prime function helpers
 * Copyright (c) 2013 Digital Bazaar, Inc.
 * Modified by Josh Ibad and Winnie Pan
 */
const BigInteger = require('jsbn').BigInteger;
const BIGINT0 = new BigInteger('0');
const BIGINT1 = new BigInteger('1');
const BIGINT256 = new BigInteger('256');


// prime constants
let LOW_PRIMES = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997];
let LP_LIMIT = (1 << 26) / LOW_PRIMES[LOW_PRIMES.length - 1];


function isProbablePrime(n) {
	n = new BigInteger(n.toString());
  // divide by low primes, ignore even checks, etc (n alread aligned properly)
  let i = 1;
  while(i < LOW_PRIMES.length) {
    let m = LOW_PRIMES[i];
    let j = i + 1;
    while(j < LOW_PRIMES.length && m < LP_LIMIT) {
      m *= LOW_PRIMES[j++];
    }
    m = n.modInt(m);
    while(i < j) {
      if(m % LOW_PRIMES[i++] === 0) { return false; }
    }
  }
  return runMillerRabin(n);
}

// HAC 4.24, Miller-Rabin
function runMillerRabin(n) {
  // n1 = n - 1
  let n1 = n.subtract(BigInteger.ONE);

  // get s and d such that n1 = 2^s * d
  let s = n1.getLowestSetBit();
  if(s <= 0) { return false; }
  let d = n1.shiftRight(s);

  let a;
  for(let i = 0; i < 3; i++) {
    // select witness 'a' at random from between 1 and n - 1
    do {
      a = new BigInteger(n.bitLength(), {
				nextBytes: (x)=>{
					for(let i = 0; i < x.length;i++) {
						x[i] = Math.floor(Math.random() * 0xff);
					}
				}
			});
    } while(a.compareTo(BigInteger.ONE) <= 0 || a.compareTo(n1) >= 0);

    // x = a^d mod n
    let x = a.modPow(d, n);

    // probably prime
    if(x.compareTo(BigInteger.ONE) === 0 || x.compareTo(n1) === 0) { continue; }

    let j = s;
    while(--j) {
      // x = x^2 mod a
      x = x.modPowInt(2, n);
      // 'n' is composite because no previous x == -1 mod n
      if(x.compareTo(BigInteger.ONE) === 0) { return false; }
      // x == -1 mod n, so probably prime
      if(x.compareTo(n1) === 0) { break; }
    }
    // 'x' is first_x^(n1/2) and is not +/- 1, so 'n' is not prime
    if(j === 0) { return false; }
  }
  return true;
}


module.exports = { isProbablePrime };