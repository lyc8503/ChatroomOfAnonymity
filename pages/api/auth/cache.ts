let codeCache: Map<string, [string, number]>

if (process.env.NODE_ENV === "production") {
  codeCache = new Map<string, [string, number]>()
} else {
  // @ts-ignore
  if (!global.codeCache) {
    // @ts-ignore
    global.codeCache = new Map<string, [string, number]>()
  }
  // @ts-ignore
  codeCache = global.codeCache
}

function setCode(sub: string, code: string, expiration: number) {
  codeCache.set(sub, [code, Date.now() + expiration * 1000])
  console.log(codeCache)
}

function deleteCode(sub: string) {
  codeCache.delete(sub)
}

function hasValidCode(sub: string) {
  if ((codeCache.get(sub)?.[1] ?? 0) > Date.now()) {
    return true
  } else {
    deleteCode(sub)
    return false
  }
}

function verifyCode(sub: string, code: string) {
  console.log(codeCache)
  return codeCache.get(sub)?.[0] === code && hasValidCode(sub)
}

export { setCode, hasValidCode, verifyCode, deleteCode }
