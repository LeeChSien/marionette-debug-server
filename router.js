var TEMPLATE_PATH = __dirname + '/template/screenshot_list.ejs';

var dataFormat = require('dateformat');
    LogReporter = require('./lib/log_reporter');

/**
 * Router is used to handle the requests from the clients.
 *
 * @class Router
 */
function Router() {}

Router.prototype = {
  /**
   * Build HTML files contain screenshot images and
   * save they in the server.
   *
   * @param {Object} data a JSON format object
   *                      contains creenshot images and info.
   * @param {String} path save the file in specificed path.
   * @param {String} [filename] specificed filename to save.
   */
  sendScreenshot: function(data, path, filename) {
    var logReporter = new LogReporter(TEMPLATE_PATH, data);
    logReporter.render();

    if (!filename) {
      var dateFilename =
        dataFormat(new Date(), 'yyyy-mm-dd-HH-MM-ss') + '.html';
      logReporter.save(path, dateFilename);
    } else {
      logReporter.save(path, filename);
    }
  }
};

module.exports = new Router();
