var schedule = require('node-schedule');

// Run the extension scraper every 24 hours.
schedule.scheduleJob('0 0 * * *', function(){
  console.log('Running plugin updater...');
  try {
    require('./lib/extension-scraper').download();
  } catch (e) {
    console.log(e);
  }
});
