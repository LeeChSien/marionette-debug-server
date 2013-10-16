var REPORT_TEMPLATE_PATH = __dirname + '/template/report.ejs',
    DIFF_TEMPLATE_PATH   = __dirname + '/template/diff.ejs',
    dataFormat = require('dateformat'),
    uuid = require('node-uuid'),
    LogReporter = require('./lib/log_reporter'),
    logReporter = {};
    MemoryPool = require('./lib/memory_pool'),
    memoryPool = {};

/**
 * Router is used to handle the requests from the clients.
 *
 * @class Router
 */
function Router() {
  logReporter = new LogReporter(REPORT_TEMPLATE_PATH, DIFF_TEMPLATE_PATH);
  memoryPool = new MemoryPool();
}

Router.prototype = {
  /**
   * Build HTML files contain screenshot images and
   * save they in the server.
   *
   * @param {Object} data a JSON format object
   *                      contains creenshot images and info.
   * @param {String} path save the file in specificed path.
   * @param {String} [_filename] specificed filename to save.
   * @return {String} specificed filename to save.
   */
  screenshot: function(data, public_path, _filename) {
    var LOG_PATH = public_path + '/logs',
        HTML_REPORT_PATH = public_path + '/html_report',
        HTML_DIFF_PATH = public_path + '/html_diff',
        filename;

    if (!_filename) {
      // If there is no filename assigned,
      // the datetime and uuid will be the filename.
      // For example, 1983-09-08-13-07-11-{uuid}.
      filename =
        dataFormat(new Date(), 'yyyy-mm-dd-HH-MM-ss-') +
        uuid.v1() + '-';
    } else {
      filename = _filename;
    }

    logReporter.exprotImage(data, LOG_PATH, filename, memoryPool);

    if(memoryPool.isDiffComplete()) {
      logReporter.saveReport(HTML_REPORT_PATH,
        filename + 'report.html', memoryPool, 'second');

      logReporter.saveDiff(HTML_DIFF_PATH,
        filename + 'diff.html', memoryPool);
      memoryPool.clear();
    } else {
      logReporter.saveReport(HTML_REPORT_PATH,
        filename + 'report.html', memoryPool, 'first');
    }

    return filename;
  }
};

module.exports = new Router();
