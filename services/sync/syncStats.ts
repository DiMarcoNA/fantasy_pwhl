import {supabaseAdmin} from "@/utils/supabase/admin"
import { runSync } from "@/utils/sync/runSync"

export async function syncStats() {
    return runSync("postgame_stats", async () => {
    

        console.log("Starting to sync postgame stats ...............");
    
        //get play by play from hockeytech
        const players = [];
    
        //map hockeytech response into a format that matches our db
    
    
        //upsert into database
        
    
        //log errors
        //if (error) throw error;
    
        return {
          recordsProcessed: players.length,
          metadata: {
            uniquePlayerCount: players.length,
          },
        };
      
      });
}

export async function syncGameScores() {
    return runSync("postgame_results", async () => {
    

        console.log("Starting to sync game results ...............");
    
        //get game results
        const players = [];
    
        //map hockeytech response into a format that matches our db
    
    
        //upsert into database
        
    
        //log errors
        //if (error) throw error;
    
        return {
          recordsProcessed: players.length,
          metadata: {
            uniquePlayerCount: players.length,
          },
        };
      
      });
}