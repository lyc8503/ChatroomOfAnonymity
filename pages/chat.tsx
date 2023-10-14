import Head from "next/head";
import {
  Button,
  Card,
  Description,
  Fieldset,
  Input,
  Page,
  Spinner,
  Textarea,
  useToasts,
} from "@geist-ui/core";
import { useState } from "react";
import { useImmer } from "use-immer";
import { useLocalStorageState } from "ahooks/lib"; //Workaround: https://github.com/vercel/next.js/issues/55791
import ChatMessage from "@/components/ChatMessage";

export default function Chat() {
  const { setToast } = useToasts({ placement: "topRight" });
  const [draft, setDraft] = useState("");
  const [inputDisabled, setInputDisabled] = useState(false);
  const [messages, updateMessages] = useImmer<any[]>([]);
  const [jwt, setJwt] = useLocalStorageState("jwt");

  const handleSend = async () => {
    if (draft === "") return;
    setInputDisabled(true);
    const resp = await fetch("/api/message/plain", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: jwt,
        message: draft,
      }),
    });
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

  return (
    <>
      <Head>
        <title>Chatroom Of Anonymity</title>
      </Head>

      <Card>
        {messages.map((message: any, index: number) => (
          <ChatMessage message={message} />
        ))}
      </Card>

      <Card>
        <Textarea
          width="80%"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="输入消息"
        ></Textarea>
        {inputDisabled ? (
          <>
            <Button disabled>
              发送中<Spinner></Spinner>
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleSend}>发送</Button>
          </>
        )}
        <Button onClick={getMessages}>get</Button>
      </Card>
    </>
  );
}
