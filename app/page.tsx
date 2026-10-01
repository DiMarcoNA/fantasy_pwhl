"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

const DRAFT_DATE = new Date("2026-11-15T12:00:00-05:00").getTime();

const updates = [
  {
    date: "October 1, 2026",
    title: "Users can create profiles",
    description:
      "Long awaited! Users can now create their own profiles on the app, and see their user homepage. (Happy Birthday Dad!!)",
  },
  {
    date: "September 6, 2026",
    title: "Project Started",
    description:
      "The PWHL Fantasy League website is officially under development!",
  },
  
];

function getTimeRemaining() {
  const difference = DRAFT_DATE - Date.now();

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export default function Home() {
  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setTime(getTimeRemaining());
  
    const timer = setInterval(() => {
      setTime(getTimeRemaining());
    }, 1000);
  
    return () => clearInterval(timer);
  }, []);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>PWHL FANTASY</div>

        <nav className={styles.nav}>
          <button><Link href='/login' className={styles.signIn}>Sign In</Link></button>
          <button className={styles.signUp}><Link href='/signup' >Create Account</Link></button>
          
        </nav>
      </header>

      <section className={styles.hero}>
        <p className={styles.eyebrow}>DRAFT DAY</p>

        <h1>Let the Draft Begin.</h1>

        <p className={styles.draftDate}>
          November 15, 2026 · 12:00 PM ET
        </p>
        <p className={styles.draftNote}>
          BTW draft day is still TBD, but the big countdown just looks cool. 
        </p>

        <div className={styles.countdown}>
          <div className={styles.timeBox}>
            <span>{time.days}</span>
            <label>Days</label>
          </div>

          <div className={styles.timeBox}>
            <span>{String(time.hours).padStart(2, "0")}</span>
            <label>Hours</label>
          </div>

          <div className={styles.timeBox}>
            <span>{String(time.minutes).padStart(2, "0")}</span>
            <label>Minutes</label>
          </div>

          <div className={styles.timeBox}>
            <span>{String(time.seconds).padStart(2, "0")}</span>
            <label>Seconds</label>
          </div>
        </div>
      </section>

      <section className={styles.updates}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>DEVELOPMENT</p>
          <h2>What we're working on</h2>
          <p>
            Follow along as we build the PWHL Fantasy League.
          </p>
        </div>

        <div className={styles.updateList}>
          {updates.map((update, index) => (
            <article className={styles.update} key={index}>
              <div className={styles.updateDate}>{update.date}</div>

              <div>
                <h3>{update.title}</h3>
                <p>{update.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <p>© 2026 PWHL Fantasy League</p>
        <p>A personal project currently under development.</p>
      </footer>
    </main>
  );
}