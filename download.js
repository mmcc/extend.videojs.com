var fileLocation = process.argv[2] || 'data/extensions.json';

require('./lib/extension-scraper').download({location: fileLocation}, function(error, results) {
  if (error) {
    return console.log('Failed:', error);
  }

  console.log('Finished successfully.');
});
