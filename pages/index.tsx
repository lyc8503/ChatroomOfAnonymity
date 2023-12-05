import Head from "next/head";
import { Button, Card, Fieldset, Input, Page, useToasts } from "@geist-ui/core";
import styles from "../styles/Home.module.css";
import { useState } from "react";
import { useLocalStorageState, useRequest } from "ahooks/lib"; //Workaround: https://github.com/vercel/next.js/issues/55791
import { useRouter } from "next/router";

export default function Home() {
  const [email, setEmail] = useState("");
  const [mailSent, setMailSent] = useState(false);
  const [nickname, setNickname] = useLocalStorageState<string | undefined>(
    "nickname"
  );
  const [code, setCode] = useState("");
  const { setToast } = useToasts({ placement: "topRight" });
  const [jwt, setJwt] = useLocalStorageState<string | undefined>("jwt");
  const router = useRouter();

  if (jwt && jwt !== "") {
    router.push("/chat");
  }

  const { run: handleEmail, loading: emailLoading } = useRequest(
    async () => {
      const resp = await fetch("/api/auth/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      if (resp.status < 400) setMailSent(true);
      setToast({
        text: (await resp.json()).msg,
        delay: 5000,
        type: resp.status >= 400 ? "error" : "success",
      });
    },
    { manual: true }
  );

  const { run: handleCode, loading: codeLoading } = useRequest(
    async () => {
      const resp = await fetch("/api/auth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sub: email,
          nickname: nickname,
          code: code,
        }),
      });

      console.log(resp);
      const r = await resp.json();
      setToast({
        text: r.msg,
        delay: 5000,
        type: resp.status >= 400 ? "error" : "success",
      });
      if (r.token) {
        setJwt(r.token);
        router.push("/chat");
      }
    },
    { manual: true }
  );

  return (
    <>
      <Head>
        <title>Chatroom Of Anonymity</title>
      </Head>

      <Card>
        <h4>Chatroom Of Anonymity</h4>
      </Card>
      <Card>
        <p>
          欢迎使用 Chatroom Of Anonymity (COA), 一个(理论上) cryptographically
          实现匿名交流的聊天室.
        </p>
        <b>如何保证我不会被开盒?</b>
        <p>TLDR: 很简单, 因为(除了你自己)没有人知道匿名者的身份.</p>
        <b>这是如何实现的?</b>
        <p>
          身份的匿名性主要由 RSA 盲签名算法保证, 目前所有的代码均开源,
          你可以自己 review 源代码验证这一点, 如果发现缺陷欢迎提出 issue.
          实现细节与原理解释请参考 GitHub README.
        </p>
        <p>填写下方的表单登录以继续:</p>

        <Input
          scale={4 / 3}
          label="邮箱"
          placeholder="请输入邮箱"
          disabled={mailSent}
          style={{ width: "300px" }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        ></Input>
        <br />

        {mailSent ? (
          <>
            <Input
              scale={4 / 3}
              label="验证码"
              placeholder="请输入验证码"
              style={{ width: "300px" }}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            ></Input>
            <br />
            <Input
              scale={4 / 3}
              label="昵称"
              placeholder="请输入昵称"
              style={{ width: "300px" }}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            ></Input>
            <br />
            <Button onClick={handleCode} loading={codeLoading}>
              登录
            </Button>
            <br />
          </>
        ) : (
          <Button onClick={handleEmail} loading={emailLoading}>
            发送验证码
          </Button>
        )}
      </Card>
      <Card>
        This is an open-source project published at{" "}
        <a href="https://github.com/lyc8503/ChatroomOfAnonymity">GitHub</a>,
        made by <a href="https://github.com/lyc8503">@lyc8503</a> and{" "}
        <a href="https://github.com/52871299hzy">@Bob Huang</a>. Feel free to
        explore its source code by yourself! Also, PRs are welcome.
      </Card>
    </>
  );
}
