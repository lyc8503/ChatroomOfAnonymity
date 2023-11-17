import type { AppProps } from "next/app";
import { GeistProvider, CssBaseline } from "@geist-ui/core";
import { useLocalStorageState } from "ahooks/lib";
import { useEffect, useState } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const [style, setStyle] = useState("light");

  useEffect(
    () =>
      setStyle(
        localStorage.getItem("isAnonymous") === "true" ? "dark" : "light",
      ),
    [],
  );

  return (
    <GeistProvider themeType={style}>
      <CssBaseline />
      <Component {...pageProps} setStyle={setStyle} />
    </GeistProvider>
  );
}
