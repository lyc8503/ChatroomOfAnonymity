import { Avatar, Card, Grid, Text, Textarea } from "@geist-ui/core";
import Markdown from "react-markdown";

export default function ChatMessage({ message }: { message: any }) {
  return (
    <>
      <Grid.Container>
        <Grid>
          <Avatar text={message.nickname} scale={2} />
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
