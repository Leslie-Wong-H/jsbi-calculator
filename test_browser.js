const { spawn } = require("child_process");
const request = require("request");
const test = require("tape");

// Start the app
const child = spawn("node", ["test_server.js"]);

test("responds to requests", (t) => {
  t.plan(3);
  let i = 0; // Closure to ensure only one request
  // Wait until the server is ready
  child.stdout.on("data", (_) => {
    // Make a request to our app
    i++;
    if (i === 1) {
      request(
        "http://127.0.0.1:8082/test/test.html",
        (error, response, body) => {
          // stop the server
          child.kill();

          // No error
          t.false(error);
          // Successful response
          t.equal(response.statusCode, 200);
          // Assert content checks
          t.notEqual(body.indexOf("All tests passed!"), -1);
        }
      );
    }
  });
});
