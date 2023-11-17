import type { NextApiRequest, NextApiResponse } from "next";
import { createRedisInstance } from "../database/redis";
import { rsaVerify } from "../cryptography/rsa";
import { sha256sum } from "../cryptography/sha256";
import { getKeypair } from "@/util/getKeypair";
import { base64UrlEncode } from "../cryptography/base64";
import { INSTANCE_NAME } from "../config";

type Data = {
  msg: string;
};

type Payload = {
  cookie: string; // Should be masked cookie hex string here
  signature: string;
  message: string;
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
  const keypair = await getKeypair();

  if (!/^[0-9a-zA-Z]{8}$/.test(payload.cookie)) {
    return res.status(400).json({ msg: "Bad Request: malformed cookie" });
  }

  if (
    rsaVerify(
      keypair.n,
      keypair.e,
      BigInt(
        "0x" +
          new TextEncoder()
            .encode(payload.cookie)
            .reduce((s, b) => s + b.toString(16).padStart(2, "0"), ""),
      ),
      BigInt("0x" + payload.signature),
    ) === false
  ) {
    res.status(401).json({ msg: "Unauthorized: invalid cookie signature" });
    return;
  }

  const message = payload.message;
  const nickname = base64UrlEncode(
    sha256sum(new TextEncoder().encode(payload.cookie + INSTANCE_NAME)),
  ).slice(0, 8);
  const sub = "Anonymous";

  console.log(`Message from ${nickname}(${sub}): ${message}`);

  const msg = {
    type: "anonymous",
    message: message,
    nickname: nickname,
    subject: sub,
    time: Date.now(),
  };

  await redis.rpush("messages", JSON.stringify(msg));
  await redis.publish("msg_channel", JSON.stringify(msg));

  res.status(200).json({ msg: "success" });
}
