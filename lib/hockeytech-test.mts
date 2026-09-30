import { getSeasons } from './hockeytech.js';
import { getTeams } from './hockeytech.js';
import { getSchedule } from './hockeytech.js';

async function testHockeyTechSeasons() {
  try {
    const seasons = await getSeasons();

    console.log('PWHL seasons:');
    seasons.forEach(({id, name}) => {
      console.log('season id: ' + id + ', name: ' + name);
    });
    //console.log(seasons);
    return {seasons};
  } catch (error) {
    console.error('HockeyTech request failed:');
    console.error(error);
  }


}

async function testHockeyTechTeams(season: number, season_name: string) {
  try {
    const teams = await getTeams(season);

    console.log('PWHL teams for ' + season_name + '(hockeyteach season id:' + season + ') :');
    teams.forEach(({name, id}) => {
      console.log(id + ': ' + name);
    });
    //console.log(teams)
  } catch (error){
    console.error('HockeyTech request failed:');
    console.error(error);
  }
}

async function testHockeyTechSchedule(season_id: number, team_id: number) {
  try {
    const schedule = await getSchedule(season_id, team_id)
    console.log('schedule for ' + team_id + ' in season ' + season_id + ': ')
    console.log(schedule)
  } catch (error){
    console.error('HockeyTech request failed:');
    console.error(error);
  }
}


const seasons = testHockeyTechSeasons();
const season_id = Math.floor((Math.random() * 11) + 1);
//const season_name = seasons.find((season) => season.id == season_id).name;
const teams = testHockeyTechTeams(season_id, "placeholder");
const team_id = Math.floor((Math.random() * 4) + 1);
const schedule = testHockeyTechSchedule(season_id, team_id);
