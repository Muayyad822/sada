const http = require('https');

const data = JSON.stringify({
  jsonrpc: "2.0",
  method: "list_tools",
  params: {},
  id: 1
});

const options = {
  hostname: 'mcp.quran.ai',
  port: 443,
  path: '/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/event-stream',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (d) => {
    body += d;
  });
  res.on('end', () => {
    console.log(body);
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.write(data);
req.end();
