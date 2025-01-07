const username = process.env.WEB_USERNAME || "admin";
const password = process.env.WEB_PASSWORD || "admin12345678";
const url = "http://127.0.0.1";
const port = process.env.PORT || 3000; /* Modify here when irregular port is allocated by container platform */
const express = require("express");
const app = express();
var exec = require("child_process").exec;
const os = require("os");
const { legacyCreateProxyMiddleware } = require("http-proxy-middleware");
var request = require("request");
var fs = require("fs");
var path = require("path");
const auth = require("basic-auth");

app.get("/", function (req, res) {
  res.send("hello world");
});

// Page access password
app.use((req, res, next) => {
  const user = auth(req);
  if (user && user.name === username && user.pass === password) {
    return next();
  }
  res.set("WWW-Authenticate", 'Basic realm="Node"');
  return res.status(401).send();
});

// Get system process table
app.get("/status", function (req, res) {
  let cmdStr = "ps -ef";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.type("html").send("<pre>Command execution error:\n" + err + "</pre>");
    }
    else {
      res.type("html").send("<pre>Get system process table:\n" + stdout + "</pre>");
    }
  });
});

// Get system listening ports
app.get("/listen", function (req, res) {
    let cmdStr = "ss -nltp";
    exec(cmdStr, function (err, stdout, stderr) {
      if (err) {
        res.type("html").send("<pre>Command execution error:\n" + err + "</pre>");
      }
      else {
        res.type("html").send("<pre>Get system listening ports:\n" + stdout + "</pre>");
      }
    });
  });


// Get node data
app.get("/list", function (req, res) {
    let cmdStr = "cat list";
    exec(cmdStr, function (err, stdout, stderr) {
      if (err) {
        res.type("html").send("<pre>Command execution error:\n" + err + "</pre>");
      }
      else {
        res.type("html").send("<pre>Node data:\n\n" + stdout + "</pre>");
      }
    });
  });

// Get system version and memory information
app.get("/info", function (req, res) {
  let cmdStr = "cat /etc/*release | grep -E ^NAME";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("Command execution error: " + err);
    }
    else {
      res.send(
        "Command execution result:\n" +
          "Linux System:" +
          stdout +
          "\nRAM:" +
          os.totalmem() / 1000 / 1000 +
          "MB"
      );
    }
  });
});

// File system read-only test
app.get("/test", function (req, res) {
  let cmdStr = 'mount | grep " / " | grep "(ro," >/dev/null';
  exec(cmdStr, function (error, stdout, stderr) {
    if (error !== null) {
      res.send("System permission is --- not read-only");
    } else {
      res.send("System permission is --- read-only");
    }
  });
});

// keepalive begin
// Web keepalive
function keep_web_alive() {
  // 1. Request homepage to keep awake
  exec("curl -m8 " + url + ":" + port, function (err, stdout, stderr) {
    if (err) {
      console.log("Keepalive-Request homepage-Command execution error: " + err);
    } else {
      console.log("Keepalive-Request homepage-Command execution successful, response message: " + stdout);
    }
  });

  // 2. Request server process status list, if web is not running, start it
  exec("pgrep -laf web.js", function (err, stdout, stderr) {
    // Check background system processes to keep awake
    if (stdout.includes("./web.js -c ./config.json")) {
      console.log("Web is running");
    }
    else {
      // Web is not running, start from command line
      exec(
        "chmod +x web.js && ./web.js -c ./config.json >/dev/null 2>&1 &", function (err, stdout, stderr) {
          if (err) {
            console.log("Keepalive-Start web-Command execution error: " + err);
          }
          else {
            console.log("Keepalive-Start web-Command execution successful!");
          }
        }
      );
    }
  });
}
setInterval(keep_web_alive, 10 * 1000);

// Argo keepalive
function keep_argo_alive() {
  exec("pgrep -laf cloudflared", function (err, stdout, stderr) {
    // Check background system processes to keep awake
    if (stdout.includes("./cloudflared")) {
      console.log("Argo is running");
    }
    else {
      // Argo is not running, start from command line
      exec(
        "bash argo.sh 2>&1 &", function (err, stdout, stderr) {
          if (err) {
            console.log("Keepalive-Start Argo-Command execution error: " + err);
          }
          else {
            console.log("Keepalive-Start Argo-Command execution successful!");
          }
        }
      );
    }
  });
}
setInterval(keep_argo_alive, 30 * 1000);

// Nezha keepalive
function keep_nezha_alive() {
  exec("pgrep -laf nezha-agent", function (err, stdout, stderr) {
    // Check background system processes to keep awake
    if (stdout.includes("./nezha-agent")) {
      console.log("Nezha is running");
    }
    else {
      // Nezha is not running, start from command line
      exec(
        "bash nezha.sh 2>&1 &", function (err, stdout, stderr) {
          if (err) {
            console.log("Keepalive-Start Nezha-Command execution error: " + err);
          }
          else {
            console.log("Keepalive-Start Nezha-Command execution successful!");
          }
        }
      );
    }
  });
}
setInterval(keep_nezha_alive, 45 * 1000);
// keepalive end

// Download web executable file
app.get("/download", function (req, res) {
  download_web((err) => {
    if (err) {
      res.send("Download file failed");
    }
    else {
      res.send("Download file successful");
    }
  });
});


app.use( /* Specific configuration migration see https://github.com/chimurai/http-proxy-middleware/blob/master/MIGRATION.md */
  legacyCreateProxyMiddleware({
    target: 'http://127.0.0.1:8080/', /* Request address that needs cross-domain processing */
    ws: true, /* Whether to proxy websocket */
    changeOrigin: true, /* Whether to change the original host header to the target URL, default false */ 
    on: {  /* http proxy event set */ 
      proxyRes: function proxyRes(proxyRes, req, res) { /* Handle proxy requests */
        // console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2)); //for debug
        // console.log(req) //for debug
        // console.log(res) //for debug
      },
      proxyReq: function proxyReq(proxyReq, req, res) { /* Handle proxy responses */
        // console.log(proxyReq); //for debug
        // console.log(req) //for debug
        // console.log(res) //for debug
      },
      error: function error(err, req, res) { /* Handle exceptions  */
        console.warn('websocket error.', err);
      }
    },
    pathRewrite: {
      '^/': '/', /* Remove slashes from the request  */
    },
    // logger: console /* Whether to open log logs  */
  })
);

// Initialization, download web
function download_web(callback) {
  let fileName = "web.js";
  let web_url =
    "https://github.com/fscarmen2/Argo-X-Container-PaaS/raw/main/files/web.js";
  let stream = fs.createWriteStream(path.join("./", fileName));
  request(web_url)
    .pipe(stream)
    .on("close", function (err) {
      if (err) {
        callback("Download file failed");
      }
      else {
        callback(null);
      }
    });
}

download_web((err) => {
  if (err) {
    console.log("Initialization-Download web file failed");
  }
  else {
    console.log("Initialization-Download web file successful");
  }
});

// Start core script to run web, Argo, and Nezha
exec("bash entrypoint.sh", function (err, stdout, stderr) {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
});

console.log(`Username is: ${username}`);
console.log(`Password is: ${password}`);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
