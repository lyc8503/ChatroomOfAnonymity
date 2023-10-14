// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { jwtVerify } from "../cryptography/jwt";
import { JWT_SECRET, generatedKeyPair } from "../config";
import { rsaSign } from "../cryptography/rsa";

type Data = {
  msg: string;
  signature?: string;
};

type Payload = {
  token: string;
  cookie: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method !== "POST") {
    res.status(405).json({ msg: "Method Not Allowed" });
    return;
  }

  const payload: Payload = req.body;
  let identity: { nickname?: string; sub?: string };
  try {
    identity = jwtVerify(payload.token || "", JWT_SECRET);
  } catch (e) {
    console.log(e);
    res.status(401).json({ msg: "Unauthorized: " + e });
    return;
  }

  console.log(`${identity.sub} requested to sign ${payload.cookie}`);

  const sig = rsaSign(
    generatedKeyPair.n,
    generatedKeyPair.d,
    BigInt("0x" + payload.cookie),
  );
  res.status(200).json({ msg: "OK", signature: sig.toString(16) });
}
