import type { NextApiRequest, NextApiResponse } from "next";
import { jwtVerify } from "../cryptography/jwt";
import { JWT_SECRET } from "../config";
import { createRedisInstance } from "../database/redis";

type Data = {
  msg: string;
};

type Payload = {
  token: string;
  message: string;
  nickname: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method !== "POST") {
    res.status(405).json({ msg: "Method Not Allowed" });
    return;
  }

  const payload: Payload = req.body;
  const redis = createRedisInstance();

  let identity: { sub?: string };
  try {
    identity = jwtVerify(payload.token, JWT_SECRET);
  } catch (e) {
    console.log(e);
    res.status(401).json({ msg: "Unauthorized: " + e });
    return;
  }

  if (
    payload.nickname &&
    (payload.nickname.length < 3 || payload.nickname.length > 20)
  ) {
    res.status(400).json({ msg: "Nickname length should be between 3 and 20" });
    return;
  }

  const message = payload.message;
  const nickname = payload.nickname;
  const sub = identity.sub;

  console.log(`Message from ${nickname}(${sub}): ${message}`);

  const msg = {
    type: "plain",
    message: message,
    nickname: nickname,
    subject: sub,
    time: Date.now(),
  };

  await redis.rpush("messages", JSON.stringify(msg));
  await redis.publish("msg_channel", JSON.stringify(msg));

  res.status(200).json({ msg: "success" });
}
