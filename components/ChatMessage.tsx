import { Avatar, Card, Grid, Text, Textarea, Tooltip } from "@geist-ui/core";
import Markdown from "react-markdown";

export default function ChatMessage({ message }: { message: any }) {
  return (
    <>
      <Grid.Container style={{ marginBlock: "0.5em" }}>
        <Grid>
          <Tooltip
            text={message.subject}
            placement="topStart"
            style={{ position: "sticky", top: "10px" }}
          >
            <Avatar text={message.nickname} scale={2} />
          </Tooltip>
        </Grid>
        <Grid
          style={{
            maxWidth: "80%",
            wordBreak: "break-word",
            wordWrap: "break-word",
          }}
        >
          <Card hoverable>
            <p style={{ lineHeight: "0.1em" }}>
              <b>{message.nickname}</b>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              {new Date(message.time).toLocaleString()}
            </p>
            <Markdown>{message.message}</Markdown>
          </Card>
        </Grid>
      </Grid.Container>
    </>
  );
}
