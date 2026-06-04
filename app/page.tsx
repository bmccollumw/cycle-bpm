'use client'

import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import styles from './page.module.css'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    if (session) router.push('/dashboard')
  }, [session, router])

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 100)
    const t2 = setTimeout(() => setShowLogin(true), 1800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (status === 'loading') return null

  return (
    <main className={styles.page}>
      <h1 className={`${styles.wordmark} ${visible ? styles.visible : ''}`}>
        CycleBPM
      </h1>

      <p className={`${styles.tagline} ${visible ? styles.visible : ''}`}>
        Sort by cadence
      </p>

      <div className={`${styles.divider} ${visible ? styles.visible : ''}`} />

      <div className={`${styles.notice} ${visible ? styles.visible : ''}`}>
        <div className={styles.noticeBox}>
          <p className={styles.noticeLabel}>Access required</p>
          <p className={styles.noticeText}>
            This app is currently in private beta. If you haven't been personally
            set up,{' '}
            <a href="mailto:bmccollumw@gmail.com">contact the owner</a>{' '}
            to request access.
          </p>
        </div>
      </div>

      <div className={`${styles.loginWrap} ${showLogin ? styles.visible : ''}`}>
        <button className={styles.loginBtn} onClick={() => signIn('spotify')}>
          Sign in with Spotify
        </button>
      </div>

      <p className={`${styles.footer} ${visible ? styles.visible : ''}`}>
        © 2026 CycleBPM
      </p>
    </main>
  )
}