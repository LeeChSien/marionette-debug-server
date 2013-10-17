var REPORT_TEMPLATE_PATH = __dirname + '/template/report.ejs',
<<<<<<< HEAD
    DIFF_TEMPLATE_PATH   = __dirname + '/template/diff.ejs',
=======
    DIFF_TEMPLATE_PATH = __dirname + '/template/diff.ejs',
>>>>>>> for_coding_style_solve
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
        PDF_REPORT_PATH = public_path + '/pdf_report',
        PDF_DIFF_PATH = public_path + '/pdf_diff',
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
      logReporter.saveHtmlReport(HTML_REPORT_PATH,
        filename + 'report.html', memoryPool, 'second');
      logReporter.savePDFReport(PDF_REPORT_PATH, LOG_PATH,
        filename + 'report.pdf', memoryPool, 'second');

      logReporter.saveHtmlDiff(HTML_DIFF_PATH,
        filename + 'diff.html', memoryPool);
      logReporter.savePDFDiff(PDF_DIFF_PATH, LOG_PATH,
        filename + 'diff.pdf', memoryPool);
      memoryPool.clear();
    } else {
      logReporter.saveHtmlReport(HTML_REPORT_PATH,
        filename + 'report.html', memoryPool, 'first');
      logReporter.savePDFReport(PDF_REPORT_PATH, LOG_PATH,
        filename + 'report.pdf', memoryPool, 'first');
    }

    return filename;
  }
};

module.exports = new Router();
