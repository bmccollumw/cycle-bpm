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
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (session) router.push('/dashboard')
  }, [session, router])

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 100)
    const t2 = setTimeout(() => setShowLogin(true), 1800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const handleContact = (e: React.MouseEvent) => {
    // Try mailto first — if it fails, copy to clipboard
    const mailto = 'bmccollumw@gmail.com'
    try {
      window.location.href = `mailto:${mailto}`
      setTimeout(() => {
        // If still on same page after 1s, mailto probably failed — copy instead
        navigator.clipboard.writeText(mailto).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2500)
        })
      }, 1000)
    } catch {
      navigator.clipboard.writeText(mailto).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      })
    }
    e.preventDefault()
  }

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
            <a href="mailto:bmccollumw@gmail.com" onClick={handleContact}>
              contact the owner
            </a>{' '}
            to request access.
          </p>
          {copied && (
            <p className={styles.copied}>
              Email copied to clipboard
            </p>
          )}
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