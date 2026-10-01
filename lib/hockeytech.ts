import {
  PwhlTeam,
  PwhlPlayer,
  PwhlGame,
  PwhlPlayerGameStats,
  PwhlGameStatus,
} from '@/types/pwhl';

const HOCKEYTECH_BASE_URL =
  'https://lscluster.hockeytech.com/feed/index.php';

const HOCKEYTECH_KEY = '694cfeed58c932ee';
const CLIENT_CODE = 'pwhl';
const SITE_ID = '2';
const PWHL_SEASON_ID = '2';




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

interface HockeyTechRosterPlayer {
  player_id: string;
  first_name: string;
  last_name: string;
  position: string;
  team_id: string;
}

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
        currentTeamHockeytechId: Number(player.team_id),
      });
    }
  }

  return normalizedPlayers;
}



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