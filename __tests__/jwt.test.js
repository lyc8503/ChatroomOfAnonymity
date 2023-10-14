import { jwtSign, jwtVerify } from "../pages/api/cryptography/jwt";
import { setIssuer } from "../pages/api/cryptography/jwt";

describe("jwt", () => {
  // Fake system time to get reproducible results
  jest.useFakeTimers().setSystemTime(1672531200000);
  setIssuer("COA");

  it("should sign", () => {
    const token = jwtSign("test user", 100, { test: 123 }, "key");
    // Test: https://jwt.io/
    expect(token).toEqual(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJDT0EiLCJzdWIiOiJ0ZXN0IHVzZXIiLCJpYXQiOjE2NzI1MzEyMDAsImV4cCI6MTY3MjUzMTMwMCwidGVzdCI6MTIzfQ.5Xt75-CnOd1WybPVW8dLVRSrA8MMF_TjpIr4t3M3gs8",
    );
  });

  it("should verify", () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJDT0EiLCJzdWIiOiJ0ZXN0IHVzZXIiLCJpYXQiOjE2NzI1MzEyMDAsImV4cCI6MTY3MjUzMTMwMCwidGVzdCI6MTIzfQ.5Xt75-CnOd1WybPVW8dLVRSrA8MMF_TjpIr4t3M3gs8";
    expect(jwtVerify(token, "key")).toEqual({
      exp: 1672531300,
      iat: 1672531200,
      iss: "COA",
      sub: "test user",
      test: 123,
    });
  });

  it("should throw error verifying invalid jwt", () => {
    expect(() => jwtVerify("invalid jwt string.abc", "key")).toThrowError(
      "Invalid JWT",
    );
    expect(() => jwtVerify("invalid jwt string.abc.def", "key")).toThrowError(
      "Invalid base64 string",
    );
  });

  it("should throw error verifying unsupported hash algorithm", () => {
    // alg = HS384
    const token =
      "eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJDT0EiLCJzdWIiOiJ0ZXN0IHVzZXIiLCJpYXQiOjE2NzI1MzEyMDAsImV4cCI6MTY3MjUzMTMwMCwidGVzdCI6MTIzfQ.xp_-sZwbpVDGs_SlM-sn-oinHnUTucRn0v4ZRff_xtaxmjpawMQImj7cfongfOsT";
    expect(() => jwtVerify(token, "key")).toThrowError("Unsupported Algorithm");
  });

  it("should throw error verifying invalid jwt header", () => {
    // typ = 123
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IjEyMyJ9.eyJpc3MiOiJDT0EiLCJzdWIiOiJ0ZXN0IHVzZXIiLCJpYXQiOjE2NzI1MzEyMDAsImV4cCI6MTY3MjUzMTMwMCwidGVzdCI6MTIzfQ.Ae-6TWLMp82V7j2JwbsHwkB-I3BPcuoSzUyIacYGSgg";
    expect(() => jwtVerify(token, "key")).toThrowError("Invalid JWT header");
  });

  it("should throw error verifying invalid jwt signature", () => {
    // key = 123
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJDT0EiLCJzdWIiOiJ0ZXN0IHVzZXIiLCJpYXQiOjE2NzI1MzEyMDAsImV4cCI6MTY3MjUzMTMwMCwidGVzdCI6MTIzfQ.2mduVwDSFeeSVRuwEWSBe4ML4sBvmZcJFRMptePXr_g";
    expect(() => jwtVerify(token, "key")).toThrowError("Invalid JWT signature");
  });

  it("should throw error verifying wrong issuer", () => {
    // iss = TEST
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJURVNUIiwic3ViIjoidGVzdCB1c2VyIiwiaWF0IjoxNjcyNTMxMjAwLCJleHAiOjE2NzI1MzEzMDAsInRlc3QiOjEyM30.Ku9lBYvJNVsP2GnwtYLvFFnJRawcA7oKct0ALAnuuTg";
    expect(() => jwtVerify(token, "key")).toThrowError("Invalid JWT issuer");
  });

  it("should throw error verifying expired token", () => {
    // Expired token
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJDT0EiLCJzdWIiOiJ0ZXN0IHVzZXIiLCJpYXQiOjE2NzI1MzEwMDAsImV4cCI6MTY3MjUzMTEwMCwidGVzdCI6MTIzfQ.I4jeFK4opzl1ZH07q1fJyhgv0xhVdSAYHgquznWaODU";
    expect(() => jwtVerify(token, "key")).toThrowError("Expired JWT");
  });
});
