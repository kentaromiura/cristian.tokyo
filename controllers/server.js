const { Model, View, Controller } = require("../minimvc");
const Router = require("universal-router");
const babel = require("@babel/core"),
  presetEnv = require("@babel/preset-env"),
  externalHelpers = require("@babel/plugin-external-helpers"),
  transformClasses = require("@babel/plugin-transform-classes");
const blog = require("../blog/src/Server.bs.js");

const wrap = require("wrapup")({
  transforms: [
    {
      src: function (module, callback) {
        module.src = babel.transform(module.src, {
          filename: module.name,
          presets: [presetEnv],
          plugins: [transformClasses],
          retainLines: true,
        }).code;
        callback(null, module);
      },
    },
  ],
});

const getBlogJS = () =>
  new Promise((ok, ko) => {
    wrap.require(__dirname + "/../blog/src/Index.bs.js").up((err, data) => {
      if (err) ko(err);
      ok(data);
    });
  });

const getPathQueryAndHash = (url) => {
  const [path, rest] = url.split("?");
  const [queryStr, hash] = (rest || "").split("#");

  const query = queryStr.split("&").map((part) => {
    const [key, value] = part.split("=");
    return { [key]: value };
  });
  return {
    pathname: path,
    query: Object.fromEntries(query),
    hash: `#${hash}`,
  };
};

module.exports = class ServerController extends Controller {
  constructor(server) {
    super();
    const routes = [
      {
        path: "/",
        children: [
          {
            path: "/robots.txt",
            action: () => `User-agent: *
            Disallow:`,
          },
          {
            path: "",
            action: () => `<html>
    <head>
        <title>Cristian.Tokyo</title>
        <link rel="preload" href="/webfonts/fa-brands-400.woff2" as="font" type="font/woff2" crossorigin>
        <link rel="preload" href="/webfonts/fa-solid-900.woff2" as="font" type="font/woff2" crossorigin>
        <link rel="prefetch" href="/img/pattern-50.png" />
        <link href="/css/all.min.css" rel="stylesheet" type="text/css" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
html, body {
    padding: 0;
    margin: 0;
    border: 0;
}

html {
    background-color: lightsteelblue;
    height: 100%;
}

body {
    background-image: url(/img/pattern-50.png);
    height: 100%;
}

.big {
    font-size: 3em;
}

/* Wobble Skew */
@-webkit-keyframes hvr-wobble-skew {
  16.65% {
    -webkit-transform: skew(-12deg);
    transform: skew(-12deg);
  }
  33.3% {
    -webkit-transform: skew(10deg);
    transform: skew(10deg);
  }
  49.95% {
    -webkit-transform: skew(-6deg);
    transform: skew(-6deg);
  }
  66.6% {
    -webkit-transform: skew(4deg);
    transform: skew(4deg);
  }
  83.25% {
    -webkit-transform: skew(-2deg);
    transform: skew(-2deg);
  }
  100% {
    -webkit-transform: skew(0);
    transform: skew(0);
  }
}
@keyframes hvr-wobble-skew {
  16.65% {
    -webkit-transform: skew(-12deg);
    transform: skew(-12deg);
  }
  33.3% {
    -webkit-transform: skew(10deg);
    transform: skew(10deg);
  }
  49.95% {
    -webkit-transform: skew(-6deg);
    transform: skew(-6deg);
  }
  66.6% {
    -webkit-transform: skew(4deg);
    transform: skew(4deg);
  }
  83.25% {
    -webkit-transform: skew(-2deg);
    transform: skew(-2deg);
  }
  100% {
    -webkit-transform: skew(0);
    transform: skew(0);
  }
}
.hvr-wobble-skew {
  display: inline-block;
  vertical-align: middle;
  -webkit-transform: perspective(1px) translateZ(0);
  transform: perspective(1px) translateZ(0);
  box-shadow: 0 0 1px rgba(0, 0, 0, 0);
}
.hvr-wobble-skew:hover, .hvr-wobble-skew:focus, .hvr-wobble-skew:active {
  -webkit-animation-name: hvr-wobble-skew;
  animation-name: hvr-wobble-skew;
  -webkit-animation-duration: 1s;
  animation-duration: 1s;
  -webkit-animation-timing-function: ease-in-out;
  animation-timing-function: ease-in-out;
  -webkit-animation-iteration-count: 1;
  animation-iteration-count: 1;
}
/* Icon Pulse Grow */
@-webkit-keyframes hvr-icon-pulse-grow {
  to {
    -webkit-transform: scale(1.3);
    transform: scale(1.3);
  }
}
@keyframes hvr-icon-pulse-grow {
  to {
    -webkit-transform: scale(1.3);
    transform: scale(1.3);
  }
}
.hvr-icon-pulse-grow {
  display: inline-block;
  vertical-align: middle;
  -webkit-transform: perspective(1px) translateZ(0);
  transform: perspective(1px) translateZ(0);
  box-shadow: 0 0 1px rgba(0, 0, 0, 0);
}
.hvr-icon-pulse-grow .hvr-icon {
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-transition-timing-function: ease-out;
  transition-timing-function: ease-out;
}
.hvr-icon-pulse-grow:hover .hvr-icon, .hvr-icon-pulse-grow:focus .hvr-icon, .hvr-icon-pulse-grow:active .hvr-icon {
  -webkit-animation-name: hvr-icon-pulse-grow;
  animation-name: hvr-icon-pulse-grow;
  -webkit-animation-duration: 0.3s;
  animation-duration: 0.3s;
  -webkit-animation-timing-function: linear;
  animation-timing-function: linear;
  -webkit-animation-iteration-count: infinite;
  animation-iteration-count: infinite;
  -webkit-animation-direction: alternate;
  animation-direction: alternate;
}
.github {
    position: absolute;
    top: 50vh;
    left: 30vw;
    outline: dashed;
    min-width: 230px;
}

.blog {
    position: absolute;
    top: 10vh;
    left: 30vw;
    min-width: 230px;
    outline: dashed;
}

.bsky {
    position: absolute;
    min-width: 230px;
    top: 30vh;
    left: 30vw;
    outline: dashed;
}

.bsky a,.blog a,.github a {
    display: flex;
    align-items: center;
    font-family: Tahoma;
    cursor: pointer;
    padding: 1em;
}
a {
    text-decoration: none;
    color: rgba(18, 77, 18, 0.8);
}
.logo {
    position:absolute;
    bottom: 0;
    right: 0;
    height: 30vh;
}
@media screen and (max-height: 443px) {
    .blog {
        top: 30vh;
        left: 10vw;
    }
    .bsky {
        top: 30vh;
        left: 40vw;
    }
    .github {
        top: 30vh;
        left: 70vw;
    }
}
</style>
    </head>
    <body>
    <picture width="305">
      <source type="image/webp" srcset="/img/logo-index.webp" class="logo"/>
      <source type="image/avif" srcset="/img/logo-index.avif" class="logo"/>
      <img src="/img/logo-index.png" alt="" class="logo"/>
    </picture>

       <div class="github hvr-wobble-skew hvr-icon-pulse-grow">
           <a href="https://github.com/kentaromiura"><i class="fab fa-github-alt big hvr-icon"></i>&nbsp; Github repository </a>
       </div>
       <div class="bsky hvr-wobble-skew hvr-icon-pulse-grow">
            <a href="https://bsky.app/profile/kentaromiura.bsky.social">
            <svg width="48px" fill="#124d12cc" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M111.8 62.2C170.2 105.9 233 194.7 256 242.4c23-47.6 85.8-136.4 144.2-180.2c42.1-31.6 110.3-56 110.3 21.8c0 15.5-8.9 130.5-14.1 149.2C478.2 298 412 314.6 353.1 304.5c102.9 17.5 129.1 75.5 72.5 133.5c-107.4 110.2-154.3-27.6-166.3-62.9l0 0c-1.7-4.9-2.6-7.8-3.3-7.8s-1.6 3-3.3 7.8l0 0c-12 35.3-59 173.1-166.3 62.9c-56.5-58-30.4-116 72.5-133.5C100 314.6 33.8 298 15.7 233.1C10.4 214.4 1.5 99.4 1.5 83.9c0-77.8 68.2-53.4 110.3-21.8z"/></svg>&nbsp; BlueSky </a>
       </div>
       <div class="blog hvr-wobble-skew hvr-icon-pulse-grow">
            <a href="/blog"><i class="fas fa-blog big hvr-icon"></i>&nbsp; Blog </a>
       </div>
    </body>
</html>`,
          },
          {
            path: "/blog",
            action() {
              console.log(blog.blogEntries);
              const content =
                "<ul>" +
                blog.blogEntries
                  .map(
                    ([slug, meta]) =>
                      `<li><a href="/blog/${slug}">${meta.title} (${meta.description})</a></li>`,
                  )
                  .join("") +
                "</ul>";

              return `<!DOCTYPE html>
              <html lang="en">
                <head>
                <title>Cristian.tokyo blog</title>
                <meta name="description" content="Cristian.tokyo blog">
                <meta charset="UTF-8">
                <meta name="theme-color" content="#C7E3BE">
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="stylesheet" href="/css/sakura.css" />
                <link rel="stylesheet" href="/css/prism.css" />
                </head>
                <body id=root>
                <header style="margin:-13px; text-align: right;background: linear-gradient(180deg, rgba(236,236,236,1) 65%, rgba(0,0,0,0) 77%)">
                  <img alt="logo" src="/img/logo.png"> by <a href="https://bsky.app/profile/kentaromiura.bsky.social">Cristian Carlesso</a>
                </header>
                  ${content}
<footer style="position: relative;"><svg height="0" xmlns="http://www.w3.org/2000/svg">
    <filter id="drop-shadow">
        <feGaussianBlur in="SourceAlpha" stdDeviation="4"></feGaussianBlur>
        <feOffset dx="1" dy="1" result="offsetblur"></feOffset>
        <feFlood flood-color="rgba(0,0,0,0.5)"></feFlood>
        <feComposite in2="offsetblur" operator="in"></feComposite>
        <feMerge>
            <feMergeNode></feMergeNode>
            <feMergeNode in="SourceGraphic"></feMergeNode>
        </feMerge>
    </filter>
</svg><sup><a href="/">
<picture style="width: 120px;filter: url(#drop-shadow);position: absolute;right: 0;">
  <source type="image/avif" srcset="/img/logo-index.avif" />
  <source type="image/webp" srcset="/img/logo-index.webp" />
  <img src="/img/logo-index.png" alt="Back to home" />
</picture></a></sup>
</footer>
                </body>
              </html>`;
            },
          },
          {
            path: "/blog/:entry",
            action(detail) {
              const {
                content,
                author,
                bsky,
                date,
                last_edit,
                title,
                description,
              } = blog.renderBlogPost(detail.params.entry);
              return `<!DOCTYPE html>
                <html lang="en">
                  <head>
                  <title>${title}</title>
                  <meta name="description" content="${description}">
                  <meta charset="UTF-8">
                  <meta name="theme-color" content="#C7E3BE">
                  <meta name="viewport" content="width=device-width, initial-scale=1" />
                  <link rel="stylesheet" href="/css/sakura.css" />
                  <link rel="stylesheet" href="/css/prism.css" />
                  </head>
                  <body id=root>
                  <header style="margin:-13px; text-align: right;background: linear-gradient(180deg, rgba(236,236,236,1) 65%, rgba(0,0,0,0) 77%)">
                    <img src="/img/logo.png"><a href="/blog">Blog index</a><br />${date}${date != last_edit ? "(last edit: " + last_edit + ")" : ""} <a href="${bsky}">${author}</a>
                  </header>
                    ${content}
<footer style="position: relative;"><svg height="0" xmlns="http://www.w3.org/2000/svg">
    <filter id="drop-shadow">
        <feGaussianBlur in="SourceAlpha" stdDeviation="4"></feGaussianBlur>
        <feOffset dx="1" dy="1" result="offsetblur"></feOffset>
        <feFlood flood-color="rgba(0,0,0,0.5)"></feFlood>
        <feComposite in2="offsetblur" operator="in"></feComposite>
        <feMerge>
            <feMergeNode></feMergeNode>
            <feMergeNode in="SourceGraphic"></feMergeNode>
        </feMerge>
    </filter>
</svg><sup><a href="/"><img src="/img/logo-index.png" style="width: 120px;filter: url(#drop-shadow);position: absolute;right: 0;"></a></sup>
</footer>
                  </body>
                </html>`;
              // return getBlogJS().then(js => {
              //   return `
              //   <html>
              //     <head>
              //     <link rel="stylesheet" href="/css/normalize.css" />
              //     <link rel="stylesheet" href="/css/sakura.css" />
              //     <script src="/js/hyperhtml.js"></script>
              //     <script>${js}</script>
              //     </head>
              //     <body id=root></body>
              //   </html>`;
              // });
            },
          },
        ],
      },
    ];
    this.router = new Router(routes, {
      errorHandler(error, context) {
        console.error(error);
        console.info(context);
        return error.status === 404
          ? "<h1>Page Not Found</h1>"
          : "<h1>Oops! Something went wrong</h1>";
      },
    });
    server(this);
  }

  handle(request, output) {
    console.log(request.url);
    const [path, query] = request.url.split("?");
    return this.router
      .resolve(getPathQueryAndHash(request.url))
      .then((html) => {
        output.write(html);
      });
  }
};
