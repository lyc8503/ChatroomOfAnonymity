import { rsaKeyGen } from "@/pages/api/cryptography/rsa";
import { createRedisInstance } from "@/pages/api/database/redis";

export const getKeypair = async () => {
  const redis = createRedisInstance();
  const n = await redis.get("keypair_n");
  const d = await redis.get("keypair_d");
  const e = await redis.get("keypair_e");
  if (n && d && e) {
    return { n: BigInt(n), e: BigInt(e), d: BigInt(d) };
  } else {
    const { e, d, n } = rsaKeyGen();

    const dayEnd = new Date();
    dayEnd.setHours(23, 59, 59, 999);

    await redis.set(
      "keypair_n",
      n.toString(),
      "EXAT",
      Math.round(dayEnd.getTime() / 1000),
    );
    await redis.set(
      "keypair_d",
      d.toString(),
      "EXAT",
      Math.round(dayEnd.getTime() / 1000),
    );
    await redis.set(
      "keypair_e",
      e.toString(),
      "EXAT",
      Math.round(dayEnd.getTime() / 1000),
    );
    return { n: n, e: e, d: d };
  }
};
