import {
  getTeams,
  getSchedule,
  getPlayers,
} from './hockeytech';

const SEASON_ID = 2;

async function main() {
  console.log('========================================');
  console.log('       HockeyTech Client Test');
  console.log('========================================');
  console.log(`Season ID: ${SEASON_ID}`);
  console.log();

  try {
    // --------------------------------------------------
    // Teams
    // --------------------------------------------------

    console.log('--- TEAMS ---');

    const teams = await getTeams(SEASON_ID);

    console.log(`Found ${teams.length} teams`);
    console.log();

    for (const team of teams) {
      console.log(
        `${team.hockeytechId}: ${team.name} (${team.abbreviation}) - ${team.city}`
      );
    }

    console.log();

    // --------------------------------------------------
    // Schedule
    // --------------------------------------------------

    console.log('--- SCHEDULE ---');

    const games = await getSchedule(SEASON_ID);

    console.log(`Found ${games.length} games`);
    console.log();

    // Print the first 5 games
    const gamesToPrint = games.slice(0, 5);

    for (const game of gamesToPrint) {
      const homeTeam = teams.find(
        (team) => team.hockeytechId === game.homeTeamHockeytechId
      );

      const awayTeam = teams.find(
        (team) => team.hockeytechId === game.awayTeamHockeytechId
      );

      console.log(`Game ${game.hockeytechId}`);
      console.log(
        `  ${awayTeam?.name ?? `Team ${game.awayTeamHockeytechId}`} ` +
        `vs ` +
        `${homeTeam?.name ?? `Team ${game.homeTeamHockeytechId}`}`
      );
      console.log(`  Start: ${game.scheduledStart}`);
      console.log(`  Score: ${game.awayScore} - ${game.homeScore}`);
      console.log(`  Status: ${game.status}`);
      console.log();
    }

    // --------------------------------------------------
    // Players
    // --------------------------------------------------

    console.log('--- PLAYERS ---');

    const players = await getPlayers(SEASON_ID);

    console.log(`Found ${players.length} players`);
    console.log();

    // Print the first 10 players
    const playersToPrint = players.slice(0, 10);

    for (const player of playersToPrint) {
      const team = teams.find(
        (team) =>
          team.hockeytechId === player.currentTeamHockeytechId
      );

      console.log(
        `${player.hockeytechId}: ` +
        `${player.firstName} ${player.lastName} ` +
        `(${player.position})`
      );

      console.log(
        `  Team: ${team?.name ?? `Team ${player.currentTeamHockeytechId}`}`
      );

      console.log();
    }

    // --------------------------------------------------
    // Summary
    // --------------------------------------------------

    console.log('--- SUMMARY ---');
    console.log(`Teams:   ${teams.length}`);
    console.log(`Games:   ${games.length}`);
    console.log(`Players: ${players.length}`);
    console.log();

    console.log('========================================');
    console.log('          Test completed');
    console.log('========================================');
  } catch (error) {
    console.error();
    console.error('========================================');
    console.error('             TEST FAILED');
    console.error('========================================');
    console.error(error);
    process.exit(1);
  }
}

main();