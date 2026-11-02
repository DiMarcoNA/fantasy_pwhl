// syncSeason.ts
import {syncSchedule}from "./sync/syncSchedule"; 
import {syncPlayers} from "./sync/syncPlayers";
import {syncTeams} from "./sync/syncTeams";



export async function syncSeason() {
    await syncTeams();
    await syncPlayers();
    await syncSchedule();
  
    console.log("Season sync complete");
  }