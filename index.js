var PUBLIC_PATH = __dirname + '/public',
    DEFAULT_SERVER_PORT = 3000,
    express = require('express'),
    router = require('./router'),
    HttpHelper = require('./lib/http_helper'),
    port = process.env.PORT ?
           process.env.PORT : DEFAULT_SERVER_PORT,
    app = express();

// Setup the static file server.
app.configure(function() {
  app.use(express.static(PUBLIC_PATH));
  app.use(express.directory(PUBLIC_PATH));
});

// The router to handle the HTTP requests.
app.post('/screenshot', function(request, response) {
  var httpHelper = new HttpHelper(request, response);

  httpHelper.postHandler(function(error, data) {
    var filename = '';
    if (error) {
      httpHelper.responseMessage('fail', error);
      return;
    }
    filename = router.screenshot(data, PUBLIC_PATH);
    httpHelper.responseMessage('success', filename);
  });
});

app.listen(port, function() {
  console.log('Server is running.');
});
