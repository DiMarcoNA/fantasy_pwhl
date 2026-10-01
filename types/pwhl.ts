export interface PwhlTeam {
    hockeytechId: number;
    name: string;
    abbreviation: string;
    city: string;
    logoUrl: string;
  }
  
  export interface PwhlPlayer {
    hockeytechId: number;
    firstName: string;
    lastName: string;
    position: string;
    currentTeamHockeytechId: number;
  }
  
  export interface PwhlGame {
    hockeytechId: number;
    seasonHockeytechId: number;
    homeTeamHockeytechId: number;
    awayTeamHockeytechId: number;
    homeScore: number;
    awayScore: number;
    scheduledStart: string;
    status: PwhlGameStatus;
  }
  
  export enum PwhlGameStatus {
    Scheduled = 1,
    InProgress = 2,
    Final = 3,
    Postponed = 4,
    Cancelled = 5,
  }

  export interface PwhlPlayerGameStats {
    hockeytechPlayerId: number;
    hockeytechGameId: number;
    hockeytechTeamId: number;
    goals: number;
    assists: number;
    pim: number;
    plusMinus: number;
    toi: number;
    saves: number;
    shotsFaced: number;
    goalsAllowed: number;  
  }