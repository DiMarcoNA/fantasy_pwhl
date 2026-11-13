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
    birthdate: string;
    shoots: string;
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
    hits: number;
    blockedShots: number;
    ppg: number;
    shg: number;
  }

  export interface PwhlGoalieGameStats {
    hockeytechPlayerId: number;
    hockeytechGameId: number;
    hockeytechTeamId: number;
    goals: number;
    assists: number;
    pim: number;
    ppg: number;
    shg: number;
    saves: number;
    shotsFaced: number;
    goalsAllowed: number;  
  }

  export interface PwhlGameStatsSummary {
    hockeytechGameId: number;
    hockeytechHomeTeamId: number;
    hockeytechAwayTeamId: number;
    status: number;
    homeGoalCount: number;
    awayGoalCount: number;
  }

  export interface GameSummary {
    meta: PwhlGameStatsSummary;
    goalies: PwhlGoalieGameStats[];
    players: PwhlPlayerGameStats[];
  }