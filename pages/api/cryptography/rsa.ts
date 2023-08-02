import assert from "node:assert"

// Return a ^ b % m
function binPow(a: bigint, b: bigint, m: bigint): bigint {
  a %= m
  let res = 1n
  while (b > 0n) {
    if (b % 2n === 1n) {
      res = res * a % m
    }
    a = a * a % m
    b /= 2n
  }
  return res
}

// Miller–Rabin primality test
// Reference: Miller–Rabin primality test
function isProbablyPrime(n: bigint, k: number): boolean {
  if (n % 2n === 0n) {  // Are u kidding me?
    return false;
  }

  let r = 0
  let d = n - 1n

  while (d % 2n === 0n) {
    r += 1
    d /= 2n
  }

  for (let i = 0; i < k; i++) {
    // A not too large random witness between 2 and n - 1
    const witness = BigInt(Math.floor(Math.random() * (Math.min(Number(n) - 1, 100000) - 2 + 1)) + 2)

    let x = binPow(witness, d, n)
    if (x === 1n || x === n - 1n) {
      continue
    }

    let flag = false
    for (let j = 1; j < r; j++) {
      x = x * x % n
      if (x === n - 1n) {
        flag = true
        break
      }
    }

    if (!flag) {
      return false
    }
  }

  return true
}

// Generate a big enough prime number
function bigPrime(): bigint {
  while (true) {
    const buf = new Uint8Array(129);  // at least 1024-bit long
    crypto.getRandomValues(buf);

    // Make sure the first byte > 0
    if(buf[0] === 0) {
      buf[0] = 1;
    }

    // Make sure it's an odd number
    if (buf[buf.length - 1] % 2 === 0) {
      buf[buf.length - 1] += 1;
    }

    const n = BigInt(`0x${Array.from(buf).map((x) => x.toString(16).padStart(2, '0')).join('')}`);
    if (isProbablyPrime(n, 20)) {
      return n
    }
  }
}

// https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm
function gcdExt(a: bigint, b: bigint): [bigint, bigint, bigint] {
  if (b === 0n) {
    return [a, 1n, 0n]
  }
  const [d, x, y] = gcdExt(b, a % b)
  return [d, y, x - y * (a / b)]
}

function rsaKeyGen(): { e: bigint, d: bigint, n: bigint } {
  const e = 65537n
  const [p, q] = [bigPrime(), bigPrime()]

  const n = p * q
  const phi = (p - 1n) * (q - 1n)
  
  let [_, d, __] = gcdExt(e, phi)
  d = (d % phi + phi) % phi

  assert(e * d % phi === 1n, "n * d % phi !== 1")

  return { e, d, n }
}


function rsaEncrypt(n: bigint, e: bigint, m: bigint): bigint {
  assert(m < n, "m >= n")
  return binPow(m, e, n)
}

function rsaDecrypt(n: bigint, d: bigint, c: bigint): bigint {
  return binPow(c, d, n)
}

export { isProbablyPrime, binPow, rsaKeyGen, rsaEncrypt, rsaDecrypt }
