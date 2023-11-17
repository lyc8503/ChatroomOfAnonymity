import Head from "next/head";
import {
  Button,
  Card,
  Input,
  Modal,
  Select,
  Textarea,
  Toggle,
  useToasts,
} from "@geist-ui/core";
import { Settings } from "@geist-ui/icons";
import { useState } from "react";
import { useImmer } from "use-immer";
import { useLocalStorageState, useRequest } from "ahooks/lib"; //Workaround: https://github.com/vercel/next.js/issues/55791
import ChatMessage from "@/components/ChatMessage";
import { useRouter } from "next/router";
import { getKeypair } from "@/util/getKeypair";
import { rsaBlindMask, rsaBlindUnmask } from "./api/cryptography/rsa";
import { sha256sum } from "./api/cryptography/sha256";
import { INSTANCE_NAME } from "./api/config";
import { base64UrlEncode } from "./api/cryptography/base64";

type SignedCookie = {
  cookie: string;
  signature: string;
};

export default function Chat({ e, n }: any) {
  e = BigInt("0x" + e);
  n = BigInt("0x" + n);
  const { setToast } = useToasts({ placement: "topRight" });
  const [draft, setDraft] = useState("");
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [isAnonymous, setIsAnonymous] = useLocalStorageState<boolean>(
    "isAnonymous",
    { defaultValue: false },
  );
  const [nickname, setNickname] = useLocalStorageState<string | undefined>(
    "nickname",
  );
  const [cookies, setCookies] = useLocalStorageState<SignedCookie[]>(
    "cookies",
    { defaultValue: [] },
  );
  const [currentCookie, setCurrentCookie] = useLocalStorageState<string>(
    "currentCookie",
    { defaultValue: "" },
  );
  const [messages, updateMessages] = useImmer<any[]>([]);
  const [jwt, setJwt] = useLocalStorageState("jwt");
  const router = useRouter();

  const handleSend = async () => {
    if (draft === "") return;
    setInputDisabled(true);
    let resp;
    if (!isAnonymous) {
      resp = await fetch("/api/message/plain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: jwt,
          message: draft,
          nickname: nickname,
        }),
      });
    } else {
      resp = await fetch("/api/message/anonymous", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cookie: currentCookie,
          message: draft,
          signature: cookies?.filter((x) => x.cookie === currentCookie)[0]
            .signature,
        }),
      });
    }

    const r = await resp.json();
    setToast({
      text: r.msg,
      delay: 5000,
      type: resp.status >= 400 ? "error" : "success",
    });
    if (resp.status < 400) {
      setDraft("");
    }
    setInputDisabled(false);
  };

  const getMessages = async () => {
    const resp = await fetch(`/api/message?token=${jwt}`);
    if (resp.status >= 400) {
      setToast({
        text: (await resp.json()).msg,
        delay: 5000,
        type: "error",
      });
      if (resp.status == 401) {
        router.push("/");
      }
      return;
    }
    if (resp.body === null) return;
    const reader = resp.body.pipeThrough(new TextDecoderStream()).getReader();
    let buf = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += value;
      const splitBuf = buf.split("\n");
      splitBuf.slice(0, -1).map((str) => {
        updateMessages((draft) => {
          draft.push(JSON.parse(str));
        });
      });
      // updateMessages([...messages, ...splitBuf.slice(0, -1).map(s=>JSON.parse(s))])
      buf = splitBuf.slice(-1)[0];
    }
  };

  const openSettings = () => setSettingsOpen(true);
  const closeSettings = () => setSettingsOpen(false);
  const getCookie = async () => {
    let entropy = new Uint8Array(8);
    crypto.getRandomValues(entropy);
    let cookie = "";
    entropy.forEach(
      (x) =>
        (cookie +=
          "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(
            x % 62,
          )),
    );
    const cookieInt = BigInt(
      "0x" +
        new TextEncoder()
          .encode(cookie)
          .reduce((s, b) => s + b.toString(16).padStart(2, "0"), ""),
    );
    entropy = new Uint8Array(64);
    crypto.getRandomValues(entropy);
    const r = BigInt(
      "0x" + entropy.reduce((s, b) => s + b.toString(16).padStart(2, "0"), ""),
    );
    const maskedCookie = rsaBlindMask(n, e, r, cookieInt);

    const resp = await fetch("/api/auth/signature", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: jwt,
        cookie: maskedCookie.toString(16),
      }),
    });
    const re = await resp.json();
    const sig = re.signature;
    const signature = rsaBlindUnmask(n, r, BigInt("0x" + sig));
    setCookies([
      ...(cookies ?? []),
      { cookie: cookie, signature: signature.toString(16) },
    ]);
    setToast({
      text: re.msg,
      delay: 5000,
      type: resp.status >= 400 ? "error" : "success",
    });
  };
  const { loading: cookieLoading, run: runGetCookie } = useRequest(getCookie, {
    manual: true,
  });

  return (
    <>
      <Head>
        <title>Chatroom Of Anonymity</title>
      </Head>

      <Card style={{ overflowY: "scroll", height: "90vh" }}>
        {messages.map((message: any, index: number) => (
          <ChatMessage key={index} message={message} />
        ))}
      </Card>

      <Card>
        <Textarea
          width="80%"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="输入消息"
        ></Textarea>
        <Button width="10%" loading={inputDisabled} onClick={handleSend}>
          发送
        </Button>
        <Button width="5%" onClick={openSettings} icon={<Settings />} />
        <Button width="5%" onClick={getMessages}>
          get
        </Button>
      </Card>
      <Modal visible={isSettingsOpen} onClose={closeSettings}>
        <Modal.Title>设置</Modal.Title>
        <Modal.Content>
          匿名开关
          <Toggle
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
          ></Toggle>
          {isAnonymous ? (
            <>
              <Select
                value={currentCookie}
                placeholder="选择饼干"
                onChange={(val) => setCurrentCookie(val as string)}
              >
                {cookies?.map((cookie: SignedCookie, index: number) => (
                  <Select.Option value={cookie.cookie} key={index.toString()}>
                    {base64UrlEncode(
                      sha256sum(
                        new TextEncoder().encode(cookie.cookie + INSTANCE_NAME),
                      ),
                    ).slice(0, 8)}
                  </Select.Option>
                ))}
              </Select>
              <Button onClick={runGetCookie} loading={cookieLoading}>
                获得新饼干
              </Button>
            </>
          ) : (
            <Input
              value={nickname}
              label="昵称"
              onChange={(e) => setNickname(e.target.value)}
            ></Input>
          )}
        </Modal.Content>
        <Modal.Action onClick={({ close }) => close()}>OK</Modal.Action>
      </Modal>
    </>
  );
}

export async function getServerSideProps() {
  const keypair = await getKeypair();
  return { props: { e: keypair.e.toString(16), n: keypair.n.toString(16) } };
}
