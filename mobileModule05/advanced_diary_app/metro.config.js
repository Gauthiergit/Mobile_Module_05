const { getDefaultConfig } = require('expo/metro-config');
const https = require('https');

const config = getDefaultConfig(__dirname);

config.server = {
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Intercepte les appels vers /api/github-token
      if (req.url === '/api/github-token' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
          const githubReq = https.request({
            hostname: 'github.com',
            path: '/login/oauth/access_token',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Content-Length': Buffer.byteLength(body)
            }
          }, (githubRes) => {
            let responseData = '';
            githubRes.on('data', chunk => { responseData += chunk; });
            githubRes.on('end', () => {
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Content-Type', 'application/json');
              res.writeHead(200);
              res.end(responseData);
            });
          });

          githubReq.on('error', (e) => {
            res.writeHead(500);
            res.end(JSON.stringify({ error: e.message }));
          });

          githubReq.write(body);
          githubReq.end();
        });
        return;
      }

      // Gestion des preflights CORS OPTIONS
      if (req.url === '/api/github-token' && req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
        res.writeHead(200);
        res.end();
        return;
      }

      return middleware(req, res, next);
    };
  },
};

module.exports = config;