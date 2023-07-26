import Head from 'next/head'
import { Button, Card, Fieldset, Input, Page } from '@geist-ui/core'
import styles from '../styles/Home.module.css'


export default function Home() {
  return (
    <>
      <Head>
        <title>Chatroom Of Anonymity</title>
      </Head>

      <div className={styles.container}>
        <h1>Hello!</h1>
      </div>

    </>
  )
}
