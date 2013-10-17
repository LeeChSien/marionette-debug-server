var fs = require('fs'),
    ejs = require('ejs'),
    ffi = require('node-ffi'),
    PDFDocument = require('pdfkit'),
    EventEmitter = require('events').EventEmitter;

var libc = new ffi.Library(null, {
  'system': ['int32', ['string']]
});

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
 * @param {String} report_template the path of template file.
 * @param {String} diff_template the path of template file.
 */
function LogReporter(report_template, diff_template) {
  if (!report_template || !diff_template) {
    throw { message: 'No param template.' };
  }

  this._reportTemplate = '';
  this._diffTemplate = '';

  this._eventEmitter = new EventEmitter();

  fs.readFile(report_template,
              'utf8',
              function(error, data) {
                this._eventEmitter.emit('reportTemplateLoaded', data);
                this._reportTemplate = data;
              }.bind(this));
  fs.readFile(diff_template,
              'utf8',
              function(error, data) {
                this._eventEmitter.emit('diffTemplateLoaded', data);
                this._diffTemplate = data;
              }.bind(this));
}

LogReporter.prototype = {

  /**
   * EXPORT the IMAGE data as a PNG file and generate DIFF IMAGE.
   *
   * @param {Object} data a JSON format object
   *                      contains creenshot images and info.
   * @param {String} path save the file in specificed path.
   * @param {String} filename specificed filename to save.
   * @param {Object} memoryPool as memory cache helper.
   *
   **/
  exprotImage: function(data, log_path, filename, memoryPool) {
    var TEXT_PATH = log_path + '/txt';

    if (!fs.existsSync(log_path)) {
      fs.mkdirSync(log_path);
    }
    if (!fs.existsSync(TEXT_PATH)) {
      fs.mkdirSync(TEXT_PATH);
    }

    for (var i = 0; i < data.screenshots.length; i++) {
      fs.writeFileSync(TEXT_PATH + '/' + filename + i + 'base64.txt',
                       data.screenshots[i].image);

      /* !!! IMAGEMAGICK ESSENTIAL !!! */
      libc.system(['convert',
        'inline:' + TEXT_PATH + '/' + filename + i + 'base64.txt',
        log_path + '/' + filename + i + '.png'].join(' '));

      var entity = memoryPool.
        findByDescription(data.screenshots[i].description);
      if (entity) {
        entity.pic.second = filename + i + '.png';

        /* !!! IMAGEMAGICK ESSENTIAL !!! */
        libc.system(['compare',
          log_path + '/' + entity.pic.first,
          log_path + '/' + entity.pic.second,
          log_path + '/' + filename + i + '_diff' + '.png'].join(' '));
        entity.pic.diff = filename + i + '_diff' + '.png';
      } else {
        entity = memoryPool.push({
          description: data.screenshots[i].description,
          pic: {
            first: filename + i + '.png',
            second: null,
            diff: null
          }
        });
      }

      console.log(entity);
    }
  },

  /**
   * Save the REPORT HTML data as a file.
   *
   * @param {String} path save the file in specificed path.
   * @param {String} filename specificed filename to save.
   * @param {Object} memoryPool as memory cache helper.
   * @param {String} part save which version of screenshots in memoryPool.
   */
  saveHtmlReport: function(path, filename, memoryPool, part) {
    if (!path || !filename) {
      throw { message: 'No param path, filename.' };
    }

    var data = {
      results: memoryPool.getResults(),
      part: part
    };
    if (this._reportTemplate !== '') {
      this._saveHtmlWithTemplate(this._reportTemplate, data,
                                 path, filename);
    } else {
      this._eventEmitter.on('reportTemplateLoaded', function(reportTemplate) {
        this._saveHtmlWithTemplate(reportTemplate, data,
                                   path, filename);
      }.bind(this));
    }
  },

  /**
   * Save the DIFF HTML data as a file.
   *
   * @param {String} path save the file in specificed path.
   * @param {String} filename specificed filename to save.
   * @param {Object} memoryPool as memory cache helper.
   */
  saveHtmlDiff: function(path, filename, memoryPool) {
    if (!path || !filename) {
      throw { message: 'No param path, filename.' };
    }

    var data = {
      results: memoryPool.getResults()
    };
    if (this._diffTemplate !== '') {
      this._saveHtmlWithTemplate(this._diffTemplate, data,
                                 path, filename);
    } else {
      this._eventEmitter.on('diffTemplateLoaded', function(diffTemplate) {
        this._saveHtmlWithTemplate(diffTemplate, data,
                                   path, filename);
      }.bind(this));
    }
  },

  /**
   * Save the data as HTML file with template.
   *
   * @param {String} template template contain.
   * @param {Object} data a JSON format object
   *                      contains creenshot images and info.
   * @param {String} path save the file in specificed path.
   * @param {String} filename specificed filename to save.
   */
  _saveHtmlWithTemplate: function(template, data, path, filename) {
    var filePath = path + '/' + filename,
        html = ejs.render(template, data);

    fs.exists(path, function(exists) {
      if (exists) {
        fs.writeFile(filePath, html);
      } else {
        fs.mkdir(path, function() {
          fs.writeFile(filePath, html);
        });
      }
    });
  },

  /**
   * Save the REPORT PDF data as a file.
   *
   * @param {String} path save the file in specificed path.
   * @param {String} filename specificed filename to save.
   * @param {Object} memoryPool as memory cache helper.
   * @param {String} part save which version of screenshots in memoryPool.
   */
  savePDFReport: function(path, log_path, filename, memoryPool, part) {
    var filePath = path + '/' + filename,
        results = memoryPool.getResults();

    var doc = new PDFDocument();

    doc.text(filename, 50, 50);
    for (var i = 0; i < results.length; i++) {
      doc.addPage();
      doc.text(results[i].description, 50, 50);
      doc.image(log_path + '/' + results[i].pic[part],
        50, 70, { fit: [300, 300] });
      doc.text('');
    }

    fs.exists(path, function(exists) {
      if (exists) {
        doc.write(filePath);
      } else {
        fs.mkdir(path, function() {
          doc.write(filePath);
        });
      }
    });
  },

  /**
   * Save the DIFF PDF data as a file.
   *
   * @param {String} path save the file in specificed path.
   * @param {String} filename specificed filename to save.
   * @param {Object} memoryPool as memory cache helper.
   */
  savePDFDiff: function(path, log_path, filename, memoryPool) {
    var filePath = path + '/' + filename,
        results = memoryPool.getResults();

    var doc = new PDFDocument();

    doc.text(filename, 50, 50);
    for (var i = 0; i < results.length; i++) {
      doc.addPage();
      doc.text(results[i].description, 50, 50);
      doc.image(log_path + '/' + results[i].pic.first,
        50, 70, { fit: [300, 300] });
      doc.image(log_path + '/' + results[i].pic.second,
        350, 70, { fit: [300, 300] });
      doc.image(log_path + '/' + results[i].pic.diff,
        50, 400, { fit: [300, 300] });
      doc.text('');
    }

    fs.exists(path, function(exists) {
      if (exists) {
        doc.write(filePath);
      } else {
        fs.mkdir(path, function() {
          doc.write(filePath);
        });
      }
    });
  }
};

module.exports = LogReporter;
