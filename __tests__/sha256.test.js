import { sha256sum } from "../pages/api/cryptography/sha256";
import crypto_ from "crypto";

function randomUint8(length) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  return array;
}

describe("Sha256", () => {
  it("should return the correct hash", () => {
    const result = Uint8Array.from(
      Buffer.from(
        "dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f",
        "hex",
      ),
    );
    expect(sha256sum(Buffer.from("Hello, World!"))).toEqual(result);
  });

  it("random sha256 test", () => {
    for (let cnt = 0; cnt < 2000; cnt++) {
      const randomTest = randomUint8(cnt);
      expect(sha256sum(randomTest)).toEqual(
        Uint8Array.from(
          crypto_.createHash("sha256").update(randomTest).digest(),
        ),
      );
    }
  });
});
