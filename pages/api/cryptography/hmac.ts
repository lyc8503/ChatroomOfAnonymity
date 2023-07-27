// Reference: https://en.wikipedia.org/wiki/HMAC

import { sha256sum } from "./sha256";

function hmacSha256(msg: Uint8Array, key: Uint8Array): Uint8Array {
  if (key.length > 64) {
    key = sha256sum(key)
  }

  if (key.length < 64) {
    const tmp = new Uint8Array(64)
    tmp.set(key)
    key = tmp
  }

  const opadKey = new Uint8Array(64)
  const ipadKey = new Uint8Array(64)

  for (let i = 0; i < 64; i++) {
    opadKey[i] = key[i] ^ 0x5c
    ipadKey[i] = key[i] ^ 0x36
  }

  const inner = new Uint8Array(64 + msg.length)
  inner.set(ipadKey)
  inner.set(msg, 64)

  const outerTmp = new Uint8Array(64 + 32)
  outerTmp.set(opadKey)
  outerTmp.set(sha256sum(inner), 64)
  return sha256sum(outerTmp)
}

export { hmacSha256 }