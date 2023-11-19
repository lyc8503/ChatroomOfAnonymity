import { rsaKeyGen } from "@/pages/api/cryptography/rsa";
import { createRedisInstance } from "@/pages/api/database/redis";

export const getKeypair = async () => {
  const redis = createRedisInstance();
  const keypair = await redis.get("keypair");
  if (keypair) {
    const [n, d, e] = keypair.split("|");
    return { n: BigInt(n), e: BigInt(e), d: BigInt(d) };
  } else {
    const { e, d, n } = rsaKeyGen();

    const dayEnd = new Date();
    dayEnd.setHours(23, 59, 59, 999);

    await redis.set(
      "keypair",
      n.toString() + "|" + d.toString() + "|" + e.toString(),
      "EXAT",
      Math.round(dayEnd.getTime() / 1000),
    );
    return { n: n, e: e, d: d };
  }
};
