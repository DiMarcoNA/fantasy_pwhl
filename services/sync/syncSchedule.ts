import {getSchedule} from "@/lib/hockeytech"
import {supabaseAdmin} from "@/utils/supabase/admin"
import { runSync } from "@/utils/sync/runSync"

export async function syncSchedule() {
    return runSync("season_games", async () => {

    console.log("Starting to sync schedule ..............");

    //create a map from hockeytech id to db id
    const teams_map = await createTeamMap();
    const season_map = await createSeasonMap();

    //get games from hockeytech
    const games = await getSchedule(1);

    //map hockeytech response into a format that matches our db
    const game_rows = games.map((game) => ({
        hockeytech_id: game.hockeytechId,
        season_id: season_map.get(game.seasonHockeytechId),
        home_team_id: teams_map.get(game.homeTeamHockeytechId),
        away_team_id: teams_map.get(game.awayTeamHockeytechId),
        home_score: game.homeScore,
        away_score: game.awayScore,
        time: game.scheduledStart,
        status: game.status,
    }));

    //upsert info into database
    const { error } = await supabaseAdmin
    .from("game")
    .upsert(game_rows, {
      onConflict: "hockeytech_id",
    });

    if (error) {
        throw error;
    }

    console.log(`Synced ${game_rows.length} games.`);
  
    if (error) throw error;

    return {
      recordsProcessed: game_rows.length,
      metadata: {
        gamesProcessed: game_rows.length,
      },
    };
  
    });


  };


export async function createTeamMap() {
    const { data: teams } = await supabaseAdmin
    .from("pwhl_team")
    .select("id, hockeytech_id");

    const teamMap = new Map<number, number>();

    teams?.forEach((team) => {
      teamMap.set(team.hockeytech_id, team.id);
    });

    return teamMap;
}; 

export async function createSeasonMap() {
    const { data: seasons } = await supabaseAdmin
    .from("season")
    .select("id, hockeytech_id");

    const seasonMap = new Map<number, number>();

    seasons?.forEach((season) => {
      seasonMap.set(season.hockeytech_id, season.id);
    });

    return seasonMap;
}; 