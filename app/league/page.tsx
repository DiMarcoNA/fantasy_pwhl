
import Link from "next/link";
import styles from "./league.module.css";

const standings = [
  { rank: 1, name: "Puck Luck", points: 42 },
  { rank: 2, name: "Ice Queens", points: 39 },
  { rank: 3, name: "Frost Giants", points: 37 },
  { rank: 4, name: "Goal Diggers", points: 31 },
];

const matchups = [
  {
    team1: "Ice Queens",
    score1: 128,
    team2: "Frost Giants",
    score2: 121,
  },
  {
    team1: "Puck Luck",
    score1: 143,
    team2: "Goal Diggers",
    score2: 118,
  },
];

export default function LeaguePage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/league" className={styles.logo}>
          PWHL FANTASY
        </Link>

        <div className={styles.headerLinks}>
          <Link href="/team" className={styles.myTeamButton}>
            My Team
          </Link>

          <Link href="/settings" className={styles.settingsButton}>
            ⚙
          </Link>
        </div>
      </header>

      <div className={styles.container}>
        <section className={styles.leagueHeader}>
          <p className={styles.season}>2026 SEASON</p>
          <h1>PWHL Fantasy League</h1>
        </section>

        <section className={styles.topGrid}>
          {/* My Team */}
          <Link href="/team" className={styles.cardLink}>
            <div className={styles.teamCard}>
              <div>
                <p className={styles.cardLabel}>MY TEAM</p>
                <h2>Ice Queens</h2>
                <p className={styles.cardDescription}>
                  View your roster, stats, and team information.
                </p>
              </div>

              <span className={styles.arrow}>→</span>
            </div>
          </Link>

          {/* Standings */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <p className={styles.cardLabel}>LEAGUE</p>
                <h2>Standings</h2>
              </div>

              <Link href="/standings" className={styles.viewLink}>
                View All →
              </Link>
            </div>

            <div className={styles.standings}>
              {standings.map((team) => (
                <div className={styles.standingRow} key={team.name}>
                  <span className={styles.rank}>{team.rank}</span>
                  <span className={styles.teamName}>{team.name}</span>
                  <span className={styles.points}>
                    {team.points} pts
                  </span>
                </div>
              ))}
            </div>
          </section>
        </section>

        {/* Weekly Matchups */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardLabel}>WEEK 3</p>
              <h2>This Week's Matchups</h2>
            </div>

            <Link href="/matchups" className={styles.viewLink}>
              View All →
            </Link>
          </div>

          <div className={styles.matchups}>
            {matchups.map((matchup, index) => (
              <div className={styles.matchup} key={index}>
                <div className={styles.matchupTeam}>
                  <span>{matchup.team1}</span>
                  <strong>{matchup.score1}</strong>
                </div>

                <span className={styles.vs}>VS</span>

                <div className={styles.matchupTeam}>
                  <strong>{matchup.score2}</strong>
                  <span>{matchup.team2}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section className={styles.quickLinks}>
          <div>
            <p className={styles.cardLabel}>HELP & SETTINGS</p>
            <h2>Quick Links</h2>
          </div>

          <div className={styles.linkGrid}>
            <Link href="/rules">Rules →</Link>
            <Link href="/faq">FAQ →</Link>
            <Link href="/settings">Settings →</Link>
            <Link href="/report-problem">Report a Problem →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
