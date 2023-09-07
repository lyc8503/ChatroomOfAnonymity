import Head from 'next/head'
import { Button, Card, Fieldset, Input, Page, useToasts } from '@geist-ui/core'
import styles from '../styles/Home.module.css'
import { useState } from 'react'



export default function Home() {

  const [email, setEmail] = useState('')
  const [mailSent, setMailSent] = useState(false)
  const [nickname, setNickname] = useState('')
  const [code, setCode] = useState('')
  const { setToast } = useToasts({placement: 'topRight'})

  const handleEmail = async () => {
    const resp = await fetch('/api/auth/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'email': email
      })
    })
    
    setMailSent(true)
    console.log(resp)
    setToast({text: (await resp.json()).msg, delay: 5000, type: resp.status>=400 ? 'error' : 'success'})
  }

  const handleLogin = async () => {
    const resp = await fetch('/api/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'sub': email,
        'nickname': nickname,
        'code': code
      })
    })

    console.log(resp)
    setToast({text: (await resp.json()).msg, delay: 5000, type: resp.status>=400 ? 'error' : 'success'})
  }

  return (
    <>
      <Head>
        <title>Chatroom Of Anonymity</title>
      </Head>

      <Card><h4>Chatroom Of Anonymity</h4></Card>
      <Card>
        <p>欢迎使用 Chatroom Of Anonymity (COA), 一个(理论上) cryptographically 实现匿名交流的聊天室.</p>
        <b>如何保证我不会被开盒?</b>
        <p>TLDR: 很简单, 因为(除了你自己)没有人知道匿名者的身份.</p>
        <b>这是如何实现的?</b>
        <p>身份的匿名性主要由 RSA 盲签名算法保证, 详细实现请参考 <a href="https://github.com/lyc8503/ChatroomOfAnonymity">GitHub 的 README</a></p>
        <p>填写下方的表单登录以继续:</p>

        <Input scale={4 / 3} label="Mail" placeholder='请输入邮箱' disabled={mailSent} style={{ width: '300px' }}
          value={email} onChange={(e) => setEmail(e.target.value)}></Input>

        {
          mailSent ?
            <>
              <Input scale={4 / 3} label="Code" placeholder='请输入验证码' style={{ width: '300px' }}
                value={code} onChange={(e) => setCode(e.target.value)}></Input><br />
              <Input scale={4 / 3} label="Name" placeholder='请输入昵称' style={{ width: '300px' }}
                value={nickname} onChange={(e) => setNickname(e.target.value)}></Input><br />
              <Button onClick={handleLogin}>登录</Button><br />
            </>
            :
            <>
              <Button onClick={handleEmail}>发送验证码</Button><br />
              <Input scale={4 / 3} disabled label="验证码" placeholder='请先获取邮件验证码' style={{ width: '300px' }}></Input><br />
              <Input scale={4 / 3} disabled label="昵称" placeholder='请先获取邮件验证码' style={{ width: '300px' }}></Input><br />
            </>
        }

      </Card>
      <Card>This is an open-source project published at <a href="https://github.com/lyc8503/ChatroomOfAnonymity">GitHub</a>, made by <a href="https://github.com/lyc8503">@lyc8503</a>. Feel free to explore its source code by yourself!</Card>
    </>
  )
}
