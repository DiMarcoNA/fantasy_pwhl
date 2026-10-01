'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import Link from "next/link";
import styles from './page.module.css'

export default function UserHomePage() {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const [firstName, setFirstName] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)

  useEffect(() => {
    async function getUserProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
  
      if (!user) {
        return
      }
  
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', user.id)
        .single()
  
      if (!error && profile) {
        setFirstName(profile.first_name)
      }
    }
  
    getUserProfile()
  }, [])

  return (
    <main className={styles.page}>
      {/* Navigation */}
      <header className={styles.header}>
        <div className={styles.logo}>PWHL FANTASY</div>

        <nav className={styles.nav}>
            <Link href="/home" className={styles.navLink}>
            Home
            </Link>

            <Link href="/league" className={styles.navLink}>
            My League
            </Link>

            <button
            onClick={handleSignOut}
            className={styles.signOut}
            >
            Sign Out
            </button>
        </nav>
      </header>
      
      {/* Main content */}
      <div className={styles.container}>
      <h1 className={styles.title}>
        Welcome {firstName}!!
      </h1>
        <h2 className={styles.title}>My Dashboard</h2>

        {/* My League */}
        <section className={styles.card}>
          <h2>My League</h2>

          <p className={styles.placeholder}>
            You are not currently part of a league.
          </p>

          <button className={styles.placeholderButton}>
            Join a League
          </button>
        </section>

        {/* Feedback */}
        <section className={styles.card}>
          <h2>Send Feedback</h2>

          <p className={styles.placeholder}>
            Send me suggestions to improve this page! Let me know about any problems as you encounter them.
          </p>

          <button
            className={styles.placeholderButton}
            onClick={() => setShowFeedback(true)}
            >
            Send Feedback
          </button>
        </section>

        {showFeedback && (
  <div
    className={styles.modalOverlay}
    onClick={() => setShowFeedback(false)}
  >
    <div
      className={styles.modal}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className={styles.closeButton}
        onClick={() => setShowFeedback(false)}
      >
        ×
      </button>

      <h2>Send Feedback</h2>

      <p className={styles.modalDescription}>
        Hi {firstName}, this feature doesn't work yet. If you have any issues, keep them to yourself for now!
      </p>

      {/* <textarea
        className={styles.feedbackInput}
        placeholder="Enter your feedback..."
      /> */}

      <button
        className={styles.placeholderButton}
        onClick={() => setShowFeedback(false)}
      >
        Go Back
      </button>
    </div>
  </div>
)}
      </div>
    </main>
  )
}