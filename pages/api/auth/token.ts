import type { NextApiRequest, NextApiResponse } from "next";
import { jwtSign } from "../cryptography/jwt";
import { JWT_SECRET } from "../config";
import { createRedisInstance } from "../database/redis";

type Data = {
  msg: string;
  token?: string;
  expiration?: number;
};

type Payload = {
  sub: string;
  code: string;
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

  const redis = createRedisInstance();
  const payload: Payload = req.body;

  if (
    payload.nickname &&
    (payload.nickname.length < 3 || payload.nickname.length > 20)
  ) {
    res.status(400).json({ msg: "Nickname length should be between 3 and 20" });
    return;
  }

  if ((await redis.get(payload.sub)) === payload.code) {
    await redis.del(payload.sub);
    const token = jwtSign(
      payload.sub,
      3 * 86400,
      { nickname: payload.nickname },
      JWT_SECRET,
    );
    res
      .status(200)
      .json({ msg: "success", token: token, expiration: 3 * 86400 });
  } else {
    res.status(401).json({ msg: "Wrong or expired verification code" });
  }
}
