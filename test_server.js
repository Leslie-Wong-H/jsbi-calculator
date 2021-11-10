const http = require("http");
const url = require("url");
const fs = require("fs");
const server = http.createServer(function (request, response) {
  const path = url.parse(request.url).pathname;
  console.log(__dirname, path);
  fs.readFile(__dirname + path, function (error, data) {
    if (error) {
      response.writeHead(404);
      response.write("This page does not exist");
      response.end();
    } else {
      response.writeHead(200, {
        "Content-Type": "text/html",
      });
      response.write(data);
      response.end();
    }
  });
});
server.listen(8082);
console.log("Server 8082 launched.");
