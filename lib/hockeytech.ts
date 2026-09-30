import { TURBOPACK_CLIENT_MIDDLEWARE_MANIFEST } from "next/dist/shared/lib/constants";

const HOCKEYTECH_BASE_URL =
  'https://lscluster.hockeytech.com/feed/index.php';

const HOCKEYTECH_KEY = '694cfeed58c932ee';
const CLIENT_CODE = 'pwhl';
const SITE_ID = '2';
const PWHL_SEASON_ID = '2';

export interface PwhlTeam {
  id: string;
  name: string;
  nickname: string;
  teamCode: string;
  divisionId: string;
  logo: string;
}


interface HockeyTechTeamsResponse {
  teamsNoAll: Array<{
    id: string;
    name: string;
    nickname: string;
    team_code: string;
    division_id: string;
    logo: string;
  }>;
}


export interface PwhlSeason {
  id: string;
  name: string;
  shortName: string;
  career: boolean;
  playoff: boolean;
  startDate: string | null;
  endDate: string | null;
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

  return data.teamsNoAll.map((team) => ({
    id: team.id,
    name: team.name,
    nickname: team.nickname,
    teamCode: team.team_code,
    divisionId: team.division_id,
    logo: team.logo,
  }));
}



/**
 * Fetch all PWHL seasons from HockeyTech.
 *
 * HockeyTech returns seasons under:
 *
 * {
 *   "SiteKit": {
 *     "Seasons": [...]
 *   }
 * }
 */
export async function getSeasons(): Promise<PwhlSeason[]> {
  const params = new URLSearchParams({
    feed: 'modulekit',
    view: 'seasons',
    key: HOCKEYTECH_KEY,
    client_code: CLIENT_CODE,
  });

  const url = `${HOCKEYTECH_BASE_URL}?${params.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `HockeyTech request failed: ${response.status} ${response.statusText}`
    );
  }

  const responseText = await response.text();

  let jsonText = responseText.trim();

  // Handle JSONP if HockeyTech wraps the response.
  const jsonpMatch = jsonText.match(
    /^[^(]+\(([\s\S]*)\);?$/
  );

  if (jsonpMatch) {
    jsonText = jsonpMatch[1];
  }

  let data: {
    SiteKit?: {
      Seasons?: Array<{
        season_id?: string | number;
        season_name?: string;
        shortname?: string;
        career?: string | number;
        playoff?: string | number;
        start_date?: string;
        end_date?: string;
      }>;
    };
  };

  try {
    data = JSON.parse(jsonText);
  } catch (error) {
    throw new Error(
      'HockeyTech returned invalid JSON',
      { cause: error }
    );
  }

  const seasons = data.SiteKit?.Seasons;

  if (!Array.isArray(seasons)) {
    throw new Error(
      'Unexpected HockeyTech response: SiteKit.Seasons was not found'
    );
  }

  return seasons.map((season) => {
    if (season.season_id === undefined || !season.season_name) {
      throw new Error(
        'Unexpected HockeyTech season format: missing season ID or name'
      );
    }

    return {
      id: String(season.season_id),
      name: season.season_name,
      shortName: season.shortname ?? season.season_name,
      career: String(season.career ?? '0') === '1',
      playoff: String(season.playoff ?? '0') === '1',
      startDate: season.start_date ?? null,
      endDate: season.end_date ?? null,
    };
  });
}


export interface PwhlGame {
  id: string;
  seasonId: string;
  date: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
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
    id: game.game_id,
    seasonId: game.season_id,
    date: game.date_played,
    homeTeamId: game.home_team,
    awayTeamId: game.visiting_team,
    homeScore:
      game.home_goal_count !== null
        ? Number(game.home_goal_count)
        : null,
    awayScore:
      game.visiting_goal_count !== null
        ? Number(game.visiting_goal_count)
        : null,
    status: game.status,
  }));
}
