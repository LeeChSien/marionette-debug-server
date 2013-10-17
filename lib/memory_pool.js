/**
 * MemoryPool is used to cache information
 * in order to compare 2 version of screenshots
 *
 * The JSON format of element in the "results" array is:
 * {
 *   description: 'image description',
 *   pic: {
 *     first:  'file path of first version screenshot',
 *     second: 'file path of second version screenshot',
 *     diff:   'file path of diff result',
 *   }
 * }
 *
 */
function MemoryPool() {
  this.results = [];
}

MemoryPool.prototype = {

  findByDescription: function(description) {
    for (var i = 0; i < this.results.length; i++) {
      if (this.results[i].description == description)
        return this.results[i];
    }
    return null;
  },

  getResults: function() {
    return this.results;
  },

  push: function(object) {
    this.results.push(object);
    return object;
  },

  clear: function() {
    return this.results = [];
  },

  isDiffComplete: function() {
    var flag = true;
    for (var i = 0; i < this.results.length; i++) {
      if (!this.results[i].pic.diff) {
        flag = false;
      }
    }
    return flag;
  }
};

module.exports = MemoryPool;
