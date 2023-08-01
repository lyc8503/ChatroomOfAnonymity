import { env } from "process"
import { setIssuer } from "./cryptography/jwt"

const INSTANCE_NAME = 'COA-test'
const JWT_SECRET = 'COA-test'
const URL = 'https://example.com'

const REDIS_CONFIG = {
  host: env.REDIS_HOST || '127.0.0.1',
  port: parseInt(env.EMAIL_PORT ?? "6379"),
  password: env.REDIS_PASSWORD
}

const EMAIL_OPTIONS = {
	host: env.EMAIL_HOST || "smtp.exmail.qq.com",
	port: parseInt(env.EMAIL_PORT ?? "465"),
	auth: {
		user: env.EMAIL_USER || 'test@test.com',
		pass: env.EMAIL_PASSWORD || 'test'
	}
}

setIssuer(INSTANCE_NAME)

export { EMAIL_OPTIONS, INSTANCE_NAME, JWT_SECRET, URL, REDIS_CONFIG }
