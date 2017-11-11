// node modules
const viperHTML = require('viperhtml');



// local modules
const cdn = require('./cdn.js');
const compressed = require('./compressed');
const indexPage = require('../view/index.js');
const stats = require('../stats.json');



// local variables
// shall we render asynchronously ?
const through = viperHTML.async();
// otherwise we could bind a context or use a wire
// const through = viperHTML.wire();

// which asset should be served as static?
const STATIC_ASSET = /^\/(?:js\/|css\/|img\/|assets\/|favicon\.ico|manifest.json|sw.js)/;

// which bundle file?
const BUNDLE = stats.assets.find(asset => asset.name === 'bundle.js');

// is this a PWA ? If the file client/sw.js exists we assume it is
const IS_PWA = require('fs').existsSync('../client/sw.js');



// App
require('http')
  .createServer((req, res) => {
    // static content
    if (STATIC_ASSET.test(req.url)) return cdn(req, res);
    
    // dynamic content
    const output = compressed(req, res, {
      'Content-Type': 'text/html'
    });

    indexPage(
      // each resolved chunk will be written right away
      through(chunk => output.write(chunk)),
      {
        title: 'Cristian.Tokyo',
        language: 'en',
        script: `${stats.publicPath}/${BUNDLE.name}`,
        isPWA: IS_PWA,
        style: viperHTML.minify.css(`
          html {
            font-family: sans-serif;
            text-align: center;
          }
          body {
	    background-color:black;
          }
          #bgmain {
            background-color: white;
            height: 100vh;
          }
          .sign {
 	    position: absolute;
            bottom: 0.5em;
            right: 2em;
            color: white;
            text-shadow: 0 0 1px black, 1px 1px 2px aquamarine, -1px -1px 2px aquamarine, 0 0 4px aquamarine;
	  }
`),
        body: [
	'<img id=bgmain src="img/background.svg" /><strong class=sign>a Cristian Carlesso site</strong></section>'
        ]
      }
    )
    .then(() => output.end())
    .catch(err => {console.error(err); res.end();});
  })
  .listen(
    process.env.PORT || 80,
    process.env.IP || '0.0.0.0',
    function () {
      var addres = this.address();
      console.log(
        `\x1B[1mviperHTML\x1B[0m http://${addres.address}:${addres.port}/`
      );
    }
  );
