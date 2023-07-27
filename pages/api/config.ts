
const INSTANCE_NAME = 'COA-test'
const JWT_SECRET = 'COA-test'

const EMAIL_OPTIONS = {
	host: "smtp.exmail.qq.com",
	port: 465,
	auth: {
		user: 'test@test.com',
		pass: 'test'
	}
}

export { EMAIL_OPTIONS, INSTANCE_NAME, JWT_SECRET }
