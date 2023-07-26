// Reference: https://en.wikipedia.org/wiki/Base64

const b64Table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const b64IndexTable = new Uint8Array(256);
for (let i = 0; i < b64Table.length; i++) {
  b64IndexTable[b64Table.charCodeAt(i)] = i;
}

function base64Encode(bytes: Uint8Array): string {
  const padding = (3 - bytes.length % 3) % 3;
  let base64 = '';

  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i];
    const b2 = bytes[i + 1] || 0;
    const b3 = bytes[i + 2] || 0;

    base64 += b64Table[b1 >> 2];
    base64 += b64Table[((b1 & 0x03) << 4) | (b2 >> 4)];
    base64 += b64Table[((b2 & 0x0f) << 2) | (b3 >> 6)];
    base64 += b64Table[b3 & 0x3f];
  }

  return base64.substring(0, base64.length - padding) + '=='.substring(0, padding);
}

function base64Decode(b64Str: string): Uint8Array {
  if (b64Str.length % 4 !== 0) {
    throw new Error('Invalid base64 string padding');
  }

  if (/[^A-Za-z0-9+\/=]/g.test(b64Str)) {
    throw new Error('Invalid base64 string');
  }

  const padding = b64Str.endsWith('==') ? 2 : b64Str.endsWith('=') ? 1 : 0;
  const buf = new Uint8Array(b64Str.length * 3 / 4 - padding);

  for (let i = 0, j = 0; i < b64Str.length; i += 4, j += 3) {
    const b1 = b64IndexTable[b64Str.charCodeAt(i)];
    const b2 = b64IndexTable[b64Str.charCodeAt(i + 1)];
    const b3 = b64IndexTable[b64Str.charCodeAt(i + 2)];
    const b4 = b64IndexTable[b64Str.charCodeAt(i + 3)];
    
    buf[j] = (b1 << 2) | (b2 >> 4);
    buf[j + 1] = ((b2 & 0x0f) << 4) | (b3 >> 2);
    buf[j + 2] = ((b3 & 0x03) << 6) | b4;
  }

  return buf;
}

function base64UrlEncode(bytes: Uint8Array): string {
  return base64Encode(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlDecode(b64Str: string): Uint8Array {
  return base64Decode(b64Str.replace(/-/g, '+').replace(/_/g, '/') + '=='.substring(0, (4 - b64Str.length % 4) % 4));
}

export { base64Encode, base64Decode, base64UrlEncode, base64UrlDecode }