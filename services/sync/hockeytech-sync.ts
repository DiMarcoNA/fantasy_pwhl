// syncSeason.ts
import {syncSchedule}from "./syncSchedule"; 
import {syncPlayers} from "./syncPlayers";
import {syncTeams} from "./syncTeams";



export async function initialSeasonSync() {
    await syncTeams();
    await syncPlayers();
    await syncSchedule();
  
    console.log("Season sync complete");
  }