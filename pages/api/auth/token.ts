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

  if ((await redis.get("code_" + payload.sub)) === payload.code) {
    await redis.del(payload.sub);
    const token = jwtSign(payload.sub, 3 * 86400, {}, JWT_SECRET);
    res
      .status(200)
      .json({ msg: "success", token: token, expiration: 3 * 86400 });
  } else {
    res.status(401).json({ msg: "Wrong or expired verification code" });
  }
}
