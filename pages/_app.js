import { SessionProvider } from 'next-auth/react'
import Layout from '../components/Layout'
import ChatWidget from '../components/ChatWidget'
import '../styles/globals.css'
 
export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <ChatWidget />
    </SessionProvider>
  )
}
