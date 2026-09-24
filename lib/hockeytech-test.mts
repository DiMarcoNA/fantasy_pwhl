
import { getSeasons } from './hockeytech.js';
import { getTeams } from './hockeytech.js';

async function testHockeyTech() {
  try {
    const seasons = await getSeasons();

    console.log('PWHL seasons:');
    console.log(seasons);
  } catch (error) {
    console.error('HockeyTech request failed:');
    console.error(error);
  }


}

testHockeyTech();



