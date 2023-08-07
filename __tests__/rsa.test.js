import { binPow, isProbablyPrime, rsaKeyGen, rsaEncrypt, rsaDecrypt, rsaSign, rsaVerify, rsaSignSHA256, rsaVerifySHA256, rsaBlindMask, rsaBlindUnmask } from '../pages/api/cryptography/rsa'


describe('RSA', () => {
  it('binpow test', () => {
    expect(binPow(2n, 3n, 5n)).toBe(3n)

    for (let i = 0; i < 1000; i++) {
      const a = BigInt(Math.floor(Math.random() * 10000))
      const b = BigInt(Math.floor(Math.random() * 1000))
      const m = BigInt(Math.floor(Math.random() * 100000) + 1)
      expect(binPow(a, b, m)).toBe(a ** b % m)
    }
  })

  it('Miller Rabin primality test', () => {
    expect(isProbablyPrime(6n, 20)).toBe(false)
    expect(isProbablyPrime(2147483647n, 20)).toBe(true)
    expect(isProbablyPrime(10001531n * 10001533n, 20)).toBe(false)

    expect(isProbablyPrime(393050634124102232869567034555427371542904833n, 20)).toBe(true)
    expect(isProbablyPrime(263130836933693530167218012159999999n, 20)).toBe(true)
    expect(isProbablyPrime(393050634124102232869567034555427371542904833n * 263130836933693530167218012159999999n, 20)).toBe(false)

    expect(isProbablyPrime(85242211202858786730267154491553963655327912877020919193394117550602885820056229703249885100818088842279128529357190087962009781n, 20)).toBe(true)
    expect(isProbablyPrime(71975181411965726322510095541947543238255795997210144129532569827028116934092531868433403311550768820891943390065129490369889451n, 20)).toBe(true)
    expect(isProbablyPrime(85242211202858786730267154491553963655327912877020919193394117550602885820056229703249885100818088842279128529357190087962009781n * 71975181411965726322510095541947543238255795997210144129532569827028116934092531868433403311550768820891943390065129490369889451n, 20)).toBe(false)
  
    expect(isProbablyPrime(463653323444023622129705087848348628585808836948884861375393821271620702650924538210627107572764674540965099010788179268888547078531862127423054143092130634252944356267588034537833531653016701772755554404059014964251330197023074323592652107515947238408850951156544836504365460971078066885578982019443n, 20)).toBe(true)
    expect(isProbablyPrime(846713601784039835330968981553703412946816604805469796006129358447031732656993561038296265502115027181855083595359697242262887072931830802587642206720384882704258521881342925635948138852942386350750225668681635150658126822015398922896922294105405503071202620842614421832841723017966191767525276967759n, 20)).toBe(true)
    expect(isProbablyPrime(463653323444023622129705087848348628585808836948884861375393821271620702650924538210627107572764674540965099010788179268888547078531862127423054143092130634252944356267588034537833531653016701772755554404059014964251330197023074323592652107515947238408850951156544836504365460971078066885578982019443n * 846713601784039835330968981553703412946816604805469796006129358447031732656993561038296265502115027181855083595359697242262887072931830802587642206720384882704258521881342925635948138852942386350750225668681635150658126822015398922896922294105405503071202620842614421832841723017966191767525276967759n, 20)).toBe(false)
  
    const primes = [101n, 103n, 107n, 109n, 113n, 127n, 131n, 137n, 139n, 149n, 151n, 157n, 163n, 167n, 173n, 179n, 181n, 191n, 193n, 197n, 199n, 211n, 223n, 227n, 229n, 233n, 239n, 241n, 251n, 257n, 263n, 269n, 271n, 277n, 281n, 283n, 293n, 307n, 311n, 313n, 317n, 331n, 337n, 347n, 349n, 353n, 359n, 367n, 373n, 379n, 383n, 389n, 397n, 401n, 409n, 419n, 421n, 431n, 433n, 439n, 443n, 449n, 457n, 461n, 463n, 467n, 479n, 487n, 491n, 499n, 503n, 509n, 521n, 523n, 541n, 547n, 557n, 563n, 569n, 571n, 577n, 587n, 593n, 599n, 601n, 607n, 613n, 617n, 619n, 631n, 641n, 643n, 647n, 653n, 659n, 661n, 673n, 677n, 683n, 691n, 701n, 709n, 719n, 727n, 733n, 739n, 743n, 751n, 757n, 761n, 769n, 773n, 787n, 797n, 809n, 811n, 821n, 823n, 827n, 829n, 839n, 853n, 857n, 859n, 863n, 877n, 881n, 883n, 887n, 907n, 911n, 919n, 929n, 937n, 941n, 947n, 953n, 967n, 971n, 977n, 983n, 991n, 997n]
    
    for (let i = 0; i < primes.length; i++) {
      expect(isProbablyPrime(primes[i], 20)).toBe(true);
      for (let j = i; j < primes.length; j++) {
        expect(isProbablyPrime(primes[i] * primes[j], 20)).toBe(false);
      }
    }
  })

  it('should generate rsa key', () => {
    const {n, e, d} = rsaKeyGen()
    expect(n >= 2n ** 2048n).toBe(true)
    expect(d >= 2n ** 2048n).toBe(true)
    expect(e).toBeGreaterThanOrEqual(65537)
  })

  it('should encrypt and decrypt', () => {
    const {n, e, d} = rsaKeyGen()

    for (let i = 0; i < 1000; i++) {
      const buf = new Uint8Array(256) // 2048 bits
      crypto.getRandomValues(buf)

      const m = BigInt('0x' + buf.reduce((s, b) => s + b.toString(16).padStart(2, '0'), ''))
      const c = rsaEncrypt(n, e, m)
      const m2 = rsaDecrypt(n, d, c)
      expect(m2 === m).toBe(true)
    }
  })

  it('should sign and verify', () => {
    const {n, e, d} = rsaKeyGen()

    const buf = new Uint8Array(256)
    expect(rsaVerifySHA256(n, e, buf, 123456n)).toBe(false)
    
    for (let i = 0; i < 1000; i++) {
      const buf = new Uint8Array(256) // 2048 bits
      crypto.getRandomValues(buf)
  
      const s = rsaSignSHA256(n, d, buf)
      expect(rsaVerifySHA256(n, e, buf, s)).toBe(true)
    }
  })

  it('should blind sign and verify', () => {
    const {n, e, d} = rsaKeyGen()
    
    for (let i = 0; i < 1000; i++) {
      const buf = new Uint8Array(128)
      crypto.getRandomValues(buf)
      const m = BigInt('0x' + buf.reduce((s, b) => s + b.toString(16).padStart(2, '0'), ''))
      
      crypto.getRandomValues(buf)
      const r = BigInt('0x' + buf.reduce((s, b) => s + b.toString(16).padStart(2, '0'), ''))

      const masked = rsaBlindMask(n, e, r, m)
      const sig = rsaSign(n, d, masked)  // <= blind sign here
      const unmasked = rsaBlindUnmask(n, r, sig)
      
      expect(rsaVerify(n, e, m, unmasked)).toBe(true)
    }
  })
})
