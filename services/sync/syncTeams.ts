import {getTeams} from "@/lib/hockeytech"
import {supabaseAdmin} from "@/utils/supabase/admin"
import { runSync, SyncResult } from "@/utils/sync/runSync"

export async function syncTeams() {
  return runSync("season_teams", async () => {

    console.log("Starting to sync teams ..............");

    //get teams from hockeytech
    const teams = await getTeams(1);

    //map hockeytech response into a format that matches our db
    const team_rows = teams.map((team) => ({
        hockeytech_id: team.hockeytechId,
        name: team.name,
        logo_url: team.logoUrl,
        abbreviation: team.abbreviation,
        city: team.city
    }));

    //upsert info into database
    const { error } = await supabaseAdmin
    .from("pwhl_team")
    .upsert(team_rows, {
      onConflict: "hockeytech_id",
    });

    if (error) {
        throw error;
    }

    console.log(`Synced ${team_rows.length} teams.`);

    if (error) throw error;

    return {
      recordsProcessed: teams.length,
      metadata: {
        teamCount: teams.length,
      },
    };
  
    });
  
  }