var LOG_FILE_PATH = __dirname + '/logs',
    SERVER_PORT = 3000;

var express = require('express'),
    router = require('./router');
    HttpHelper = require('./lib/http_helper');

var app = express();
// Setup the static file server.
app.configure(function() {
  app.use(express.static(LOG_FILE_PATH));
  app.use(express.directory(LOG_FILE_PATH));
});

// The router to handle the HTTP requests.
app.post('/sendScreenshot', function(request, response) {
  var httpHelper = new HttpHelper(request, response);

  httpHelper.postHandler(function(data) {
    router.sendScreenshot(data, LOG_FILE_PATH);
    httpHelper.responseMessage('success');
  });
});

app.listen(SERVER_PORT, function() {
  console.log('Server is running.');
});
