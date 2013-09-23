var fs = require('fs'),
    ejs = require('ejs');

var reportTemplate = '',
    reportData = {},
    reportResult = '';

/**
 * LogReporter is used to generate the HTML format report
 * with screenshots info.
 *
 * The JSON format of the "data" param is:
 * {
 *   screenshots: [
 *     { description: 'the first one', image: 'data:image/png;base64,' },
 *     { description: 'the second one', image: 'data:image/png;base64,' }
 *   ]
 * }
 *
 * @class LogReporter
 * @param {String} template the path of template file.
 * @param {Object} data a JSON format object
 *                      contains creenshot images and info.
 */
function LogReporter(template, data) {
  if (!template || !data) {
    throw { message: 'No param template, data.' };
  }
  reportTemplate = fs.readFileSync(template, 'utf8');
  reportData = data;
}

/**
 * Generate the HTML format string
 * with screenshot data and the template.
 *
 * @return {String} the HTML format string.
 */
LogReporter.prototype.render = function() {
  reportResult = ejs.render(reportTemplate, reportData);
  return reportResult;
};

/**
 * Save the HTML data as a file.
 *
 * @param {String} path save the file in specificed path.
 * @param {String} filename specificed filename to save.
 */
LogReporter.prototype.save = function(path, filename) {
  if (!path || !filename) {
    throw { message: 'No param path, filename.' };
  }

  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
  fs.writeFile(path + '/' + filename, reportResult);
};

module.exports = LogReporter;
