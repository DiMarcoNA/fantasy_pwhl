import { PwhlGameStatsSummary } from '../types/pwhl';
import {
  PwhlTeam,
  PwhlPlayer,
  PwhlGame,
  PwhlPlayerGameStats,
  PwhlGoalieGameStats,
  PwhlGameStatus,
  GameSummary,
} from '@/types/pwhl';

const HOCKEYTECH_BASE_URL =
  'https://lscluster.hockeytech.com/feed/index.php';

const HOCKEYTECH_KEY = '694cfeed58c932ee';
const CLIENT_CODE = 'pwhl';
const SITE_ID = '2';
const PWHL_SEASON_ID = '2';



//this is how the hockeytech response is structured, inside the teamsNoAll array response
interface HockeyTechTeam {
  id: string;
  name: string;
  nickname: string;
  city: string;
  team_code: string;
  logo: string;
}


interface HockeyTechTeamsResponse {
  teamsNoAll: HockeyTechTeam[];
}


/**
 * Fetch all PWHL teams from HockeyTech.
 */
export async function getTeams(season_id: number): Promise<PwhlTeam[]> {
  const params = new URLSearchParams({
    feed: 'statviewfeed',
    view: 'teamsForSeason',
    season: season_id.toString(),
    key: HOCKEYTECH_KEY,
    client_code: CLIENT_CODE,
    site_id: SITE_ID,
    callback: 'angular.callbacks._4',
  });

  const url = `${HOCKEYTECH_BASE_URL}?${params.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `HockeyTech request failed: ${response.status} ${response.statusText}`
    );
  }

  const responseText = await response.text();

  const prefix = 'angular.callbacks._4(';

  if (!responseText.startsWith(prefix)) {
    throw new Error(
      'Unexpected HockeyTech response format: JSONP wrapper not found'
    );
  }

  let jsonText = responseText.slice(prefix.length);

  if (jsonText.endsWith(');')) {
    jsonText = jsonText.slice(0, -2);
  } else if (jsonText.endsWith(')')) {
    jsonText = jsonText.slice(0, -1);
  }

  let data: HockeyTechTeamsResponse;

  try {
    data = JSON.parse(jsonText);
  } catch (error) {
    throw new Error(
      'HockeyTech returned invalid JSON',
      { cause: error }
    );
  }

  if (!Array.isArray(data.teamsNoAll)) {
    throw new Error(
      'Unexpected HockeyTech response: teamsNoAll was not found'
    );
  }

  const normalizedTeams: PwhlTeam[] = data.teamsNoAll.map((team) => ({
    hockeytechId: Number(team.id),
    name: team.name,
    abbreviation: team.team_code,
    city: team.city,
    logoUrl: team.logo,
  }));
  
  return normalizedTeams;

}

//schedule response is from sitekit, uses the following format, array of games
interface HockeyTechScheduleResponse {
  SiteKit?: {
    Schedule?: Array<{
      game_id: string;
      season_id: string;
      date_played: string;
      home_team: string;
      visiting_team: string;
      home_goal_count: string | null;
      visiting_goal_count: string | null;
      status: string;
    }>;
  };
}

/**
 * Fetch the PWHL schedule for a HockeyTech season.
 */
export async function getSchedule(
  seasonId: number,
  teamId?: number 
): Promise<PwhlGame[]> {
  const params = new URLSearchParams({
    feed: 'modulekit',
    view: 'schedule',
    season_id: seasonId.toString(),
    key: HOCKEYTECH_KEY,
    client_code: CLIENT_CODE,
  });

  if (teamId) {
    params.set('team_id', teamId.toString());
  }

  const url = `${HOCKEYTECH_BASE_URL}?${params.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `HockeyTech request failed: ${response.status} ${response.statusText}`
    );
  }

  let text = await response.text();

  // HockeyTech may return JSON or JSONP.
  if (text.startsWith('angular.callbacks.')) {
    const firstParen = text.indexOf('(');
    const lastParen = text.lastIndexOf(')');

    if (firstParen === -1 || lastParen === -1) {
      throw new Error(
        'Unexpected HockeyTech response format: invalid JSONP'
      );
    }

    text = text.slice(firstParen + 1, lastParen);
  }

  let data: HockeyTechScheduleResponse;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('HockeyTech returned invalid JSON');
  }

  const schedule = data.SiteKit?.Schedule;
  //console.log(schedule);

  if (!Array.isArray(schedule)) {
    throw new Error(
      'Unexpected HockeyTech response: Schedule array was not found'
    );
  }


  return schedule.map((game) => ({
    hockeytechId: Number(game.game_id),
    seasonHockeytechId: Number(game.season_id),
    homeTeamHockeytechId: Number(game.home_team),
    awayTeamHockeytechId: Number(game.visiting_team),
  
    homeScore:
      game.home_goal_count !== null
        ? Number(game.home_goal_count)
        : 0,
  
    awayScore:
      game.visiting_goal_count !== null
        ? Number(game.visiting_goal_count)
        : 0,
  
    scheduledStart: game.date_played,
    status: normalizeGameStatus(game.status),
  }));
}

//how hockeytech returns players in a alist of rosters
interface HockeyTechRosterPlayer {
  player_id: string;
  first_name: string;
  last_name: string;
  position: string;
  team_id: string;
  shoots: string;
  birthdate: string;
}

//not used, but roster response also returns staff so the declaration is important
interface HockeyTechRosterStaff {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  team_id: string;
  role_id: string;
  role: string;
  person_id: string;
  jersey_number: string;
  start_date: string;
  end_date: string;
  is_admin: string;
  division: string;
}

//overall format of roster response
interface HockeyTechRosterResponse {
  SiteKit: {
    Roster: (
      | HockeyTechRosterPlayer
      | HockeyTechRosterStaff[]
    )[];
  };
}

/**
 * Fetch all PWHL players for a season from HockeyTech.
 */
export async function getPlayers(
  seasonId: number
): Promise<PwhlPlayer[]> {
  const teams = await getTeams(seasonId);
  const normalizedPlayers: PwhlPlayer[] = [];

  for (const team of teams) {
    const params = new URLSearchParams({
      feed: 'modulekit',
      view: 'roster',
      team_id: team.hockeytechId.toString(),
      season_id: seasonId.toString(),
      key: HOCKEYTECH_KEY,
      client_code: CLIENT_CODE,
      site_id: SITE_ID,
      callback: 'angular.callbacks._4',
    });

    const url = `${HOCKEYTECH_BASE_URL}?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `HockeyTech roster request failed for team ${team.hockeytechId}: ` +
        `${response.status} ${response.statusText}`
      );
    }

    const responseText = await response.text();
    const prefix = 'angular.callbacks._4(';

    if (!responseText.startsWith(prefix)) {
      throw new Error(
        `Unexpected HockeyTech roster response format for team ${team.hockeytechId}`
      );
    }

    let jsonText = responseText.slice(prefix.length);

    if (jsonText.endsWith(');')) {
      jsonText = jsonText.slice(0, -2);
    } else if (jsonText.endsWith(')')) {
      jsonText = jsonText.slice(0, -1);
    }

    let data: HockeyTechRosterResponse;

    try {
      data = JSON.parse(jsonText);
    } catch (error) {
      throw new Error(
        `HockeyTech returned invalid roster JSON for team ${team.hockeytechId}`,
        { cause: error }
      );
    }

    if (!Array.isArray(data.SiteKit?.Roster)) {
      throw new Error(
        `Unexpected HockeyTech roster response for team ${team.hockeytechId}: ` +
        `Roster was not found`
      );
    }

    // Roster contains player objects followed by a nested array of staff.
    const players = data.SiteKit.Roster.filter(
      (item): item is HockeyTechRosterPlayer => !Array.isArray(item)
    );

    for (const player of players) {
      normalizedPlayers.push({
        hockeytechId: Number(player.player_id),
        firstName: player.first_name,
        lastName: player.last_name,
        position: player.position,
        shoots: player.shoots,
        birthdate: player.birthdate,
        currentTeamHockeytechId: Number(player.team_id),
      });
    }
  }
  const uniquePlayers = Array.from(
    new Map(
      normalizedPlayers.map(player => [
        player.hockeytechId,
        player,
      ])
    ).values()
  );
  
  return uniquePlayers;

  
}

interface HockeyTechGameSummaryMeta {
  id: string;
  league_id: string;
  home_team: string;
  visiting_team: string;
  status: string;
  home_goal_count: string;
  visiting_goal_count: string;
}

interface HockeyTechGameSummaryPlayer {
  player_id: string;
  goals: string;
  assists: string;
  plusminus: string;
  pim: string;
  hits: string;
  shots_on: string;
  power_play_goals: string;
  short_handed_goals: string;
  game_winning_goal: string;
  shots_blocked_by_player: string;
}

interface HockeyTechGameSummaryGoalies {
  player_id: string;
  goals: string;
  assists: string;
  saves: string;
  goals_against: string;
  win: string;
  loss: string;
  tie: string;
  shutout: string;
  shots_against: string;
  pim: string;
  power_play_goals: string;
  short_handed_goals: string;
  game_winning_goal: string;

}


interface HockeyTechGameSummaryResponse {
  GC: {
    Gamesummary: {
      meta: HockeyTechGameSummaryMeta;
      goalies: {
        visitor: HockeyTechGameSummaryGoalies[];
        home: HockeyTechGameSummaryGoalies[];
      };
      home_team_lineup: {
        players: HockeyTechGameSummaryPlayer[];
      };
      visitor_team_lineup: {
        players: HockeyTechGameSummaryPlayer[];
      };

    }
  }
}


export async function getGameStats(
  game_id: number
): Promise<GameSummary> {
  const params = new URLSearchParams({
    feed: 'gc',
    tab: 'gamesummary',
    key: HOCKEYTECH_KEY,
    game_id: game_id.toString(),
    client_code: CLIENT_CODE,
    site_id: SITE_ID,
    callback: 'angular.callbacks._4',
  });

  const url = `${HOCKEYTECH_BASE_URL}?${params.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `HockeyTech request failed: ${response.status} ${response.statusText}`
    );
  }

  const responseText = await response.text();

  const prefix = 'angular.callbacks._4(';

  if (!responseText.startsWith(prefix)) {
    throw new Error(
      'Unexpected HockeyTech response format: JSONP wrapper not found'
    );
  }

  let jsonText = responseText.slice(prefix.length);

  if (jsonText.endsWith(');')) {
    jsonText = jsonText.slice(0, -2);
  } else if (jsonText.endsWith(')')) {
    jsonText = jsonText.slice(0, -1);
  }

  let data: HockeyTechGameSummaryResponse;
  
  try {
    data = JSON.parse(jsonText);
  } catch (error) {
    throw new Error(
      'HockeyTech returned invalid JSON',
      { cause: error }
    );
  }

  const metaResponse = data.GC.Gamesummary.meta;

  const loadGameMeta: PwhlGameStatsSummary = {
    hockeytechGameId: Number(metaResponse.id),
    hockeytechHomeTeamId: Number(metaResponse.home_team),
    hockeytechAwayTeamId: Number(metaResponse.visiting_team),
    status: Number(metaResponse.status),
    homeGoalCount: Number(metaResponse.home_goal_count),
    awayGoalCount: Number(metaResponse.visiting_goal_count),
  };
  
  const loadHomeGoalieStats: PwhlGoalieGameStats[] = data.GC.Gamesummary.goalies.visitor.map((goalie) => ({
    hockeytechPlayerId: Number(goalie.player_id),
    hockeytechGameId: Number(metaResponse.id),
    hockeytechTeamId: Number(metaResponse.visiting_team),
    goals: Number(goalie.goals),
    assists: Number(goalie.assists),
    pim: Number(goalie.pim),
    ppg: Number(goalie.power_play_goals),
    shg: Number(goalie.short_handed_goals),
    saves: Number(goalie.saves),
    shotsFaced: Number(goalie.shots_against),
    goalsAllowed: Number(goalie.goals_against),
  }));

  const loadAwayGoalieStats: PwhlGoalieGameStats[] = data.GC.Gamesummary.goalies.home.map((goalie) => ({
    hockeytechPlayerId: Number(goalie.player_id),
    hockeytechGameId: Number(metaResponse.id),
    hockeytechTeamId: Number(metaResponse.home_team),
    goals: Number(goalie.goals),
    assists: Number(goalie.assists),
    pim: Number(goalie.pim),
    ppg: Number(goalie.power_play_goals),
    shg: Number(goalie.short_handed_goals),
    saves: Number(goalie.saves),
    shotsFaced: Number(goalie.shots_against),
    goalsAllowed: Number(goalie.goals_against),
  }));

  const loadHomePlayerStats: PwhlPlayerGameStats[] = data.GC.Gamesummary.home_team_lineup.players.map((player) => ({
    hockeytechPlayerId: Number(player.player_id),
    hockeytechGameId: Number(metaResponse.id),
    hockeytechTeamId: Number(metaResponse.home_team),
    goals: Number(player.goals),
    assists: Number(player.assists),
    pim: Number(player.pim),
    plusMinus: Number(player.plusminus),
    hits: Number(player.hits),
    blockedShots: Number(player.shots_blocked_by_player),
    ppg: Number(player.power_play_goals),
    shg: Number(player.short_handed_goals)
  }));

  const loadAwayPlayerStats: PwhlPlayerGameStats[] = data.GC.Gamesummary.visitor_team_lineup.players.map((player) => ({
    hockeytechPlayerId: Number(player.player_id),
    hockeytechGameId: Number(metaResponse.id),
    hockeytechTeamId: Number(metaResponse.visiting_team),
    goals: Number(player.goals),
    assists: Number(player.assists),
    pim: Number(player.pim),
    plusMinus: Number(player.plusminus),
    hits: Number(player.hits),
    blockedShots: Number(player.shots_blocked_by_player),
    ppg: Number(player.power_play_goals),
    shg: Number(player.short_handed_goals)
  }));


  return {
    meta: loadGameMeta,
    goalies: loadHomeGoalieStats.concat(loadAwayGoalieStats),
    players: loadHomePlayerStats.concat(loadAwayPlayerStats)
  };
}

/*
  Hockeytech uses an integer for game status, we want to also deal with integers 
  but for readability and future development, much easier to also declare an interface 
  that defines those types in the project
*/
function normalizeGameStatus(status: string): PwhlGameStatus {
  switch (status) {
    case '1':
      return PwhlGameStatus.Scheduled;

    case '2':
      return PwhlGameStatus.InProgress;

    case '3':
      return PwhlGameStatus.Final;

    case '4':
      return PwhlGameStatus.Postponed;

    case '5':
      return PwhlGameStatus.Cancelled;

    default:
      throw new Error(`Unknown HockeyTech game status: ${status}`);
  }
}