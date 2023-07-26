import { base64Decode, base64Encode, base64UrlEncode, base64UrlDecode } from '../pages/api/cryptography/base64';


function randomUint8(length) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  return array;
}

describe('Base64 Encode', () => {
  it('should encode base64 string', () => {
    const base64 = 'SGVsbG8gV29ybGQh';
    const decoded = 'Hello World!';

    expect(base64Encode(Buffer.from(decoded))).toEqual(base64);
  })

  it('random encode test', () => {
    for (let cnt = 0; cnt < 1000; cnt++) {
      const randomTest = randomUint8(cnt);
      const encoded = base64Encode(randomTest);

      expect(encoded).toEqual(Buffer.from(randomTest).toString('base64'));
    }
  })
})

describe('Base64 Decode', () => {
  it('should decode base64 string', () => {
    const base64 = 'SGVsbG8gV29ybGQh';
    const decoded = 'Hello World!';

    expect(Buffer.from(base64Decode(base64)).toString()).toEqual(decoded);
  })

  it('should throw error decoding wrong padding', () => {
    expect(() => base64Decode('SGVsbG8gV29ybGQh=')).toThrowError('Invalid base64 string padding');
  })

  it('should throw error decoding invalid string', () => {
    expect(() => base64Decode('Hello World!')).toThrowError('Invalid base64 string');
  })

  it('random decode test', () => {
    for (let cnt = 0; cnt < 1000; cnt++) {
      const randomTest = randomUint8(cnt);
      const decoded = base64Decode(Buffer.from(randomTest).toString('base64'));
      
      expect(decoded).toEqual(randomTest);
    }
  })
})

describe('Base64 URL', () => {
  it('random encode test', () => {
    for (let cnt = 0; cnt < 1000; cnt++) {
      const randomTest = randomUint8(cnt);
      const encoded = base64UrlEncode(randomTest, true);
      expect(encoded).toEqual(Buffer.from(randomTest).toString('base64url'));
    }
  })

  it('random decode test', () => {
    for (let cnt = 0; cnt < 1000; cnt++) {
      const randomTest = randomUint8(cnt);
      const decoded = base64UrlDecode(Buffer.from(randomTest).toString('base64url'));
      
      expect(decoded).toEqual(randomTest);
    }
  })
})
