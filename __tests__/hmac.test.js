import { hmacSha256 } from "../pages/api/cryptography/hmac";

describe("Hmac", () => {
  it("should return the correct hash (short key)", () => {
    const result = Uint8Array.from(
      Buffer.from(
        "7f424e2d0ff6bd5dec626e0102755bafec91c3510f19739a4eaec8f3bc3a01a4",
        "hex",
      ),
    );
    expect(
      hmacSha256(Buffer.from("Hello, World!"), Buffer.from("key")),
    ).toEqual(result);
  });

  it("should return the correct hash (64 bytes long key)", () => {
    const result = Uint8Array.from(
      Buffer.from(
        "c4d6f86e38540fa0a07e9749aa044c218929495d632ae764fb295c66cfb61044",
        "hex",
      ),
    );
    expect(
      hmacSha256(
        Buffer.from("64 bytes long key test"),
        Buffer.from(
          "1234567812345678123456781234567812345678123456781234567812345678",
        ),
      ),
    ).toEqual(result);
  });

  it("should return the correct hash (long key)", () => {
    const result = Uint8Array.from(
      Buffer.from(
        "796a540994580363185c18b22415954e3d76ec6efa7ad1bbe64541b876b8dffa",
        "hex",
      ),
    );
    expect(
      hmacSha256(
        Buffer.from("longer key test"),
        Buffer.from(
          "Xpe$*ZxsW3gKqqdyte7gnGJfFpfWWt*@eMjyxrRR9CypvDK%68t7WxK&d^vs8zn34uPJ6d",
        ),
      ),
    ).toEqual(result);
  });
});
