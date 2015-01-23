var schedule = require('node-schedule');

var extensionScraper = require('./lib/extension-scraper');

// Run the extension scraper every 24 hours.
schedule.scheduleJob('0 0 * * *', function(){
  console.log('Running plugin updater...');
  try {
    extensionScraper.download();
  } catch (e) {
    console.log(e);
  }
});


// Things we want to export if people actually require this module.
var ex = {
  scrape: function() {
    extensionScraper.download();
  }
}

module.exports = ex;
