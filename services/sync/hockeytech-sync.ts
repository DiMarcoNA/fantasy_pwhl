// syncSeason.ts
import {syncSchedule} from "./syncSchedule"; 
import {initialPlayersSync, playerTransactionSync} from "./syncPlayers";
import {syncStats, syncGameScores} from "./syncStats";
import {syncTeams} from "./syncTeams";



export async function initialSeasonSync() {
    await syncTeams();
    await initialPlayersSync();
    await syncSchedule();
  
    console.log("Season sync complete");
  }


export async function dailyLeagueSync() {
    await playerTransactionSync();
    await syncSchedule();
}


export async function postGameSync() {
    await syncStats();
    await syncGameScores();
}