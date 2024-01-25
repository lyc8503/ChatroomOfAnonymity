import {
  Avatar,
  Card,
  Divider,
  Grid,
  Text,
  Textarea,
  Tooltip,
} from "@geist-ui/core";
import Markdown from "react-markdown";

export default function ChatMessage({ message }: { message: any }) {
  return (
    <>
      <Grid.Container style={{ marginBlock: "0.5em" }}>
        <Grid>
          {/* <Tooltip
            text={message.subject}
            placement="topStart"
            style={{ position: "sticky", top: "10px" }}
          > */}
          <div title={message.subject}>
            <Avatar text={message.nickname} scale={2} />
          </div>
          {/* </Tooltip> */}
        </Grid>
        <Grid
          style={{
            maxWidth: "80%",
            wordBreak: "break-word",
            wordWrap: "break-word",
          }}
        >
          <Card hoverable>
            <p>
              <b>{message.nickname}</b>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              {new Date(message.time).toLocaleString()}
            </p>
            <Markdown
              components={{
                img(props) {
                  const { node, ...rest } = props;
                  return <img referrerPolicy="no-referrer" {...rest} />;
                },
              }}
            >
              {message.message}
            </Markdown>
          </Card>
        </Grid>
      </Grid.Container>
    </>
  );
}
