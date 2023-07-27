// Reference: https://datatracker.ietf.org/doc/html/rfc7519

import { INSTANCE_NAME } from "../config"
import { base64UrlDecode, base64UrlEncode } from "./base64"
import { hmacSha256 } from "./hmac"

let ISSUER = INSTANCE_NAME

function setIssuer(issuer: string) {
  ISSUER = issuer
}

function jwtSign(subject: string, validFor: number, extraData: object, secret: string): string {
  const header = {
    'alg': 'HS256',
    'typ': 'JWT'
  }

  const payload = {
    'iss': ISSUER,
    'sub': subject,
    'iat': Math.floor(Date.now() / 1000),
    'exp': Math.floor(Date.now() / 1000) + validFor
  }

  Object.assign(payload, extraData)

  const headerBase64 = base64UrlEncode(Buffer.from(JSON.stringify(header)))
  const payloadBase64 = base64UrlEncode(Buffer.from(JSON.stringify(payload)))

  const signature = hmacSha256(Buffer.from(`${headerBase64}.${payloadBase64}`), Buffer.from(secret))

  return `${headerBase64}.${payloadBase64}.${base64UrlEncode(signature)}`
}

function jwtVerify(token: string, secret: string): object {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Invalid JWT')

  const [headerBase64, payloadBase64, signatureBase64] = parts

  const header = JSON.parse(Buffer.from(base64UrlDecode(headerBase64)).toString())
  if (header.alg !== 'HS256') throw new Error('Unsupported Algorithm')
  if (header.typ !== 'JWT') throw new Error('Invalid JWT header')

  const signature = base64UrlEncode(hmacSha256(Buffer.from(`${headerBase64}.${payloadBase64}`), Buffer.from(secret)))
  if (signature !== signatureBase64) throw new Error('Invalid JWT signature')

  const payload = JSON.parse(Buffer.from(base64UrlDecode(payloadBase64)).toString())
  if (payload.iss !== ISSUER) throw new Error('Invalid JWT issuer')
  if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error('Expired JWT')

  return payload
}

export { jwtSign, jwtVerify, setIssuer }