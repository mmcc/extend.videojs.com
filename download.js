require('./lib/extension-scraper').download(function(error, results) {
  if (error) {
    return console.log('Failed:', error);
  }

  console.log('Finished successfully.');
});
