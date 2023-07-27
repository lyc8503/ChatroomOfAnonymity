// Reference: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf

import { assert } from "console"

const K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]


const MODULUS = 2 ** 32

function rotr(n: number, x: number) {
  return (x >>> n) | (x << (32 - n))
}

function shr(n: number, x: number) {
  return x >>> n
}

function ch(x: number, y: number, z: number) {
  return (x & y) ^ (~x & z)
}

function maj(x: number, y: number, z: number) {
  return (x & y) ^ (x & z) ^ (y & z)
}

function sigma0(x: number) {
  return rotr(2, x) ^ rotr(13, x) ^ rotr(22, x)
}

function sigma1(x: number) {
  return rotr(6, x) ^ rotr(11, x) ^ rotr(25, x)
}

function gamma0(x: number) {
  return rotr(7, x) ^ rotr(18, x) ^ shr(3, x)
}

function gamma1(x: number) {
  return rotr(17, x) ^ rotr(19, x) ^ shr(10, x)
}

function sha256sum(content: Uint8Array): Uint8Array {
  // bitwise operations are limited to 32 bits in javascript, so we can't handle more than 2^32 bits of data (which is enough in our case)
  assert(content.length * 8 < 2 ** 32)

  const hash = Uint32Array.from([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19])

  const bitLen = content.length * 8
  const paddingLen = (448 - (bitLen + 1) % 512 + 512) % 512
  const paddedByteLen = (bitLen + 1 + paddingLen + 64) / 8

  for (let i = 0; i < paddedByteLen / 64; i++) {
    
    let block;
    // Preprocessing the block
    if (i + 1 !== paddedByteLen / 64) {
      block = content.slice(i * 64, (i + 1) * 64)

      // Padding could be in the last but one block
      if (block.length < 64) {
        block = new Uint8Array(64)
        block.set(content.slice(i * 64, (i + 1) * 64))
        block[content.length % 64] = 0x80
      }
    } else {
      block = new Uint8Array(64)
      block.set(content.slice(i * 64, (i + 1) * 64))
      
      // The padded `1` could also be in the last block
      if (i * 64 <= content.length) {
        block[content.length % 64] = 0x80
      }
      // big endian bit length at end (should be 64 bits, but we can only handle 32 bits here)
      block[60] = (bitLen >>> 24) & 0xff
      block[61] = (bitLen >>> 16) & 0xff
      block[62] = (bitLen >>> 8) & 0xff
      block[63] = bitLen & 0xff
    }

    // Prepare the message schedule
    const w = new Uint32Array(64)
    for (let t = 0; t < w.length; t++) {
      if (t <= 15) {
        w[t] = (block[t * 4] << 24) | (block[t * 4 + 1] << 16) | (block[t * 4 + 2] << 8) | (block[t * 4 + 3])
      } else {
        w[t] = gamma1(w[t - 2]) + w[t - 7] + gamma0(w[t - 15]) + w[t - 16]
      }
    }

    // Initialize the eight working variables
    let a = hash[0]
    let b = hash[1]
    let c = hash[2]
    let d = hash[3]
    let e = hash[4]
    let f = hash[5]
    let g = hash[6]
    let h = hash[7]

    // Main loop
    for (let t = 0; t < 64; t++) {
      const T1 = (h + sigma1(e) + ch(e, f, g) + K[t] + w[t]) % MODULUS
      const T2 = (sigma0(a) + maj(a, b, c)) % MODULUS
      h = g
      g = f
      f = e
      e = (d + T1) % MODULUS
      d = c
      c = b
      b = a
      a = (T1 + T2) % MODULUS
    }

    // Update hash value
    hash[0] = (hash[0] + a) % MODULUS
    hash[1] = (hash[1] + b) % MODULUS
    hash[2] = (hash[2] + c) % MODULUS
    hash[3] = (hash[3] + d) % MODULUS
    hash[4] = (hash[4] + e) % MODULUS
    hash[5] = (hash[5] + f) % MODULUS
    hash[6] = (hash[6] + g) % MODULUS
    hash[7] = (hash[7] + h) % MODULUS
  }

  // Convert from Uint32Array to Uint8Array (Big endian)
  const result = new Uint8Array(32)
  const view = new DataView(result.buffer)
  for (let i = 0; i < 8; i++) {
    view.setUint32(i * 4, hash[i])
  }
  
  return result
}

export { sha256sum }