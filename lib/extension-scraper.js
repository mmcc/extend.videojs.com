/**
* A lot of this was either ripped directly from Grunt's plugin scraper or heavily influenced by it.
*/
var request = require('request');
var _ = require('lodash');
var async = require('async');
var ent = require('ent');
var fs = require('fs');

require('date-utils');

// A list of extensions that are bad and should feel bad.
var bannedExtensions = [];

var pluginFile = 'data/extensions.json';

function getPlugin(item, callback) {
  var name = item.key[1];
  var url = 'https://skimdb.npmjs.com/registry/' + name;
  request({url: url, json: true}, function handlePlugin(error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(null, condensePlugin(body));
    } else {
      console.log('Failed to get data for:', name);
      callback(null, null);
    }
  });
}

function getDownloads(item, callback) {
  var name = item.name;
  var url = 'https://api.npmjs.org/downloads/point/last-month/' + name;
  request({url: url, json: true}, function handlePlugin(error, response, body) {
    if (!error && response.statusCode == 200) {
      if (body.downloads) {
        item.downloads = body.downloads;
      } else {
        item.downloads = 0;
      }
      callback(null, item);
    } else {
      callback(null, item);
    }
  });
}


function condensePlugin(plugin) {
  return _.assign(_.pick(plugin,
                         'name',
                         'description',
                         'author',
                         'keywords',
                         'license',
                         'url',
                         'time',
                         'readme'), {
                           version: plugin['dist-tags'].latest
                         });
}

function getPlugins(opts, callback) {
  console.log('Downloading plugin list, this may take awhile...');

  async.waterfall([
    // download plugin names based on the keyword
    function(callback) {
      var startKey = 'videojs-plugin';
      var endKey = 'videojs-skin';
      var url = 'https://skimdb.npmjs.com/registry/_design/app/_view/byKeyword?startkey=[%22' +
      startKey + '%22]&endkey=[%22' + endKey + '%22,{}]&group_level=3';
      request({url: url, json: true}, function handlePluginList(error, response, body) {
        if (!error && response.statusCode == 200) {
          callback(null, body.rows);
        } else {
          callback(null, new Error(error));
        }
      });
    },
    function(results, callback){
      console.log('Downloading npm data for each extension...');

      var filtered = _.filter(results, function (el) {
        return _.indexOf(bannedExtensions, el.key[1]) == -1;
      });

      async.mapLimit(filtered, 200, getPlugin, function(err, results){
        // registry can be out of sync with deleted plugins
        var results = _.reject(results, function(plugin) { return plugin === null; });
        callback(err, results);
      });
    },
    function(results, callback){
      console.log('Fetching download information...');

      async.mapLimit(results, 200, getDownloads, function(err, results){
        callback(err, results);
      });
    }
    ], function (err, pluginList) {
      if (err) {
        console.log(err);
      } else {
        console.log('Saving to "' + pluginFile + '"...');

        fs.writeFile(pluginFile, JSON.stringify(pluginList), function (err) {
          if (err) throw err;
          console.log('Saved!');
          if (callback) callback(err, true);
        });
      }
    });
  }

  function download(opts, callback) {
    opts = opts || {};

    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }

    fs.stat(pluginFile, function (err) {
      if (err || !opts.cache) {
        if (err) {
          console.log('File missing...');
        }
        getPlugins(opts, callback);

      } else {
        console.log('File already cached. Manually delete to redownload...');
      }
    });
  }

  module.exports.download = download;
