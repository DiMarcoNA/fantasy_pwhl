import {getPlayers} from "@/lib/hockeytech"
import {supabaseAdmin} from "@/utils/supabase/admin"
export async function syncPlayers() {
    console.log("Starting to sync players ...............");

    //get players from hockeytech
    const players = await getPlayers(1);

    //map hockeytech response into a format that matches our db
    const player_rows = players.map((player) => ({
        hockeytech_id: player.hockeytechId,
        first_name: player.firstName,
        last_name: player.lastName,
        position: player.position,
        birthdate: player.birthdate,
        shoots: player.shoots,
    }));

    console.log(
      "Players fetched:",
      player_rows.length
    );
    
    console.log(
      "Unique IDs:",
      new Set(
        player_rows.map(p => p.hockeytech_id)
      ).size
    );

    //upsert into database
    const {error} = await supabaseAdmin
    .from("player")
    .upsert(player_rows, {
        onConflict: "hockeytech_id",
      });

      if (error) {
        throw error;
    }
    console.log(`Synced ${player_rows.length} players.`);
  }


