// node modules
const consolemd = require('consolemd');
const {join} = require('path');

// local modules
const cdn = require('./cdn.js');
const compressed = require('./compressed.js');
const noCache = require('./no-cache.js');

// local variables
// which asset should be served as static (CDN optimizations)?
const STATIC_ASSET = /^\/(?:js\/|css\/|img\/|webfonts\/|assets\/|favicon\.ico|manifest.json)/;

// is this a PWA ? If the file client/sw.js exists we assume it is
const IS_PWA = require('fs').existsSync(join(__dirname, '..', 'client', 'sw.js'));

// if needed, always serve a fresh new Service Worker file
const SW_FILE = /^\/sw\.js(?:\?|#|$)/;

// shall we render asynchronously ?
// const through = viperHTML.async();
// otherwise we could bind a context or use a wire
// const through = viperHTML.wire();
module.exports = (controller) => {

const server = (req, res) => {

  // Service Worker
  if (IS_PWA && SW_FILE.test(req.url))
    return noCache(req, res,
      join(__dirname, '..', '..', 'public', 'sw.js'),
      {'Content-Type': 'application/javascript'}
    );

  // static content
  if (STATIC_ASSET.test(req.url))
    return cdn(req, res);
  
  // dynamic HTML content (index only in this case)
  const output = compressed(req, res, {
    'Content-Type': 'text/html'
  });

  controller.handle(req, output)
  .then(() => output.end())
  .catch(err => { console.error(err); res.end(); });
};
// Certificate
// const privateKey = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/privkey.pem', 'utf8');
// const certificate = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/cert.pem', 'utf8');
// const ca = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/chain.pem', 'utf8');

// const credentials = {
// 	key: privateKey,
// 	cert: certificate,
// 	ca: ca
// };
// App
//require('https').
require('http')
.createServer(server)
.listen(
  process.env.PORT || 3000,
  process.env.IP || '0.0.0.0',
  function () {
    var address = this.address();
    setTimeout(
      consolemd.log,
      1000,
      ` #green(✔) *App running* at `
    );
    setTimeout(
      console.log,
      1005,
      `http://${
        IS_PWA ? 'localhost' : address.address
      }:${address.port}/`
    )
  }
);
}