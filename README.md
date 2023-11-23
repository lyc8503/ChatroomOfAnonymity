## Chatroom Of Anonymity

It's generally available now, BUT IT'S JUST A PROOF-OF-CONCEPT IMPLEMENTATION AND NOT READY FOR ANY SERIOUS USAGE.

Online Demo (NJU users only): https://wildptr.de/

### 原理及实现

希望实现的目标: 用户可以实名登录 COA 发言, 同时也可以匿名发言, 匿名发言者必须经过身份验证, 但同时任何人不能得知匿名发言者的真实身份.

目前的实现方式:

1. 用户经过邮箱验证码验证确认身份, 服务器签发用户实名对应的 **token** (JWT 实现).

2. 用户发送实名消息时, 需提供 **token** 验证身份.

3. 用户需要发送匿名消息时, 需自行生成一个 **Cookie** (8位随机字符串, 对应一个匿名身份), 将 **Cookie** 和 **token** 提供给服务器进行 [RSA 盲签名](https://en.wikipedia.org/wiki/Blind_signature).
   由于在传递给服务器签名前, **Cookie** 已在客户端进行致盲处理, 服务器不能得知 **Cookie** 明文和 **token** 的对应关系.

4. 用户发送匿名消息时, 提供 **Cookie** 明文以及对应的签名验证身份, 为防止伪造他人匿名身份, **Cookie** 明文会经过哈希处理再显示.

5. 目前服务器的 RSA 密钥对会在每日 0:00 重置, 即每日的 **Cookie** 有效期到当日 24:00.
