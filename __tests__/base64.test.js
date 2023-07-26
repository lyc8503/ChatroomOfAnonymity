import { b64Decode, b64Encode } from '../pages/api/cryptography/base64';


function randomUint8(length) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  return array;
}

describe('Base64 Encode', () => {
  it('should encode base64 string', () => {
    const base64 = 'SGVsbG8gV29ybGQh';
    const decoded = 'Hello World!';

    expect(b64Encode(Buffer.from(decoded))).toEqual(base64);
  })

  it('random encode test', () => {
    for (let cnt = 0; cnt < 1000; cnt++) {
      const randomTest = randomUint8(cnt);
      const encoded = b64Encode(randomTest);

      expect(Buffer.from(randomTest).toString('base64')).toEqual(encoded);
    }
  })
})

describe('Base64 Decode', () => {
  it('should decode base64 string', () => {
    const base64 = 'SGVsbG8gV29ybGQh';
    const decoded = 'Hello World!';

    expect(Buffer.from(b64Decode(base64)).toString()).toEqual(decoded);
  })

  it('should throw error decoding wrong padding', () => {
    expect(() => b64Decode('SGVsbG8gV29ybGQh=')).toThrowError('Invalid base64 string padding');
  })

  it('should throw error decoding invalid string', () => {
    expect(() => b64Decode('Hello World!')).toThrowError('Invalid base64 string');
  })

  it('random decode test', () => {
    for (let cnt = 0; cnt < 1000; cnt++) {
      const randomTest = randomUint8(cnt);
      const decoded = b64Decode(Buffer.from(randomTest).toString('base64'));
      
      expect(decoded).toEqual(randomTest);
    }
  })
})
