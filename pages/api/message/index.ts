import type { NextApiRequest, NextApiResponse } from 'next'
import { jwtVerify } from '../cryptography/jwt'
import { JWT_SECRET } from '../config'
import { createRedisInstance } from '../database/redis'

type Payload = {
  token?: string
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ msg: 'Method Not Allowed' })
    return
  }

  const payload: Payload = req.query
  const redis = createRedisInstance()

  let identity: { nickname?: string, sub?: string };
  try {
    identity = jwtVerify(payload.token || "", JWT_SECRET)
  } catch(e) {
    console.log(e);
    res.status(401).json({ msg: 'Unauthorized: ' + e })
    return
  }

  res.setHeader('Content-Type', 'text/event-stream;charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');

  const historyMessages = await redis.lrange('messages', 0, -1)
  for (const msg of historyMessages) {
    res.write(msg + "\n")
  }

  redis.on('message', (channel, message) => {
    if (channel !== 'msg_channel') return
    res.write(message + "\n")
  })
  
  await redis.subscribe('msg_channel')
  // Never resolve
  await new Promise(() => 0)
}
