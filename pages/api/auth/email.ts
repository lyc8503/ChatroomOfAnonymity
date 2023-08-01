import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'
import { EMAIL_OPTIONS, INSTANCE_NAME, URL } from '../config'
import { createRedisInstance } from '../database/redis'

type Data = {
  msg: string
}

type Payload = {
  email: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    res.status(405).json({ msg: 'Method Not Allowed' })
    return
  }

  const redis = createRedisInstance()
  const payload: Payload = req.body

  const code = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
  console.log(`Verification code request from ${payload.email}: ${code}`)
  await redis.set(payload.email, code, 'EX', 5 * 60)

  try {
    const result = await nodemailer.createTransport(EMAIL_OPTIONS).sendMail({
      from: EMAIL_OPTIONS.auth.user,
      to: payload.email,
      subject: 'Email Verification',
      text: `Verification code from ${INSTANCE_NAME}(${URL}): ${code}. If you didn't request this code, you can safely ignore this email.`
    })
    console.log(result)
    
    res.status(200).json({ msg: 'success' })
  } catch (e) {
    console.log(e)
    res.status(500).json({ msg: 'Mail send failed: ' + e })
  }
}
