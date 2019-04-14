const { Model, View, Controller } = require('../minimvc');
const Router = require('universal-router');
const babel = require('@babel/core'),
  presetEnv = require('@babel/preset-env'),
  externalHelpers = require('@babel/plugin-external-helpers'),
  transformClasses = require('@babel/plugin-transform-classes');
const blog = require('../blog/src/Server.bs.js')

const wrap = require('wrapup')({
  transforms: [
    {
      src: function (module, callback) {
        module.src = babel.transform(module.src, {
          filename: module.name,
          presets: [presetEnv],
          plugins: [transformClasses],
          retainLines: true
        }).code;
        callback(null, module);
      }
    }
  ]
});

const getBlogJS = () =>
  new Promise((ok, ko) => {
    wrap.require(__dirname + '/../blog/src/Index.bs.js').up((err, data) => {
      if (err) ko(err);
      ok(data);
    });
  });

module.exports = class ServerController extends Controller {
  constructor(server) {
    super();
    const routes = [
      {
        path: '/',
        children: [
          {
            path: '/robots.txt',
            action: () => `User-agent: *
            Disallow:`
          },
          {
            path: '',
            action: () => 'Hello root'
          },
          {
            path: '/blog',
            action() {
              console.log(blog.blogEntries)
              const content = '<ul>' + blog.blogEntries.map(([slug, meta]) =>
                `<li><a href="/blog/${slug}">${meta.title} (${meta.description})</a></li>`
              ).join('') + '</ul>'

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
                  <img alt="logo" src="/img/logo.png"> by <a href="https://twitter.com/@kentaromiura">Cristian Carlesso</a>
                </header>
                  ${content}
                </body>
              </html>`
            }
          },
          {
            path: '/blog/:entry',
            action(detail) {
              const {
                content,
                author,
                twitter,
                date,
                last_edit,
                title,
                description
              } = blog.renderBlogPost(detail.params.entry)
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
                    <img src="/img/logo.png"><a href="/blog">Blog index</a><br />${date}${date != last_edit ? "(last edit: " + last_edit + ")" : ""} <a href="https://twitter.com/${twitter}">${author}</a>
                  </header>
                    ${content}
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
            }
          }
        ]
      }
    ];
    this.router = new Router(routes, {
      errorHandler(error, context) {
        console.error(error);
        console.info(context);
        return error.status === 404 ? '<h1>Page Not Found</h1>' : '<h1>Oops! Something went wrong</h1>';
      }
    });
    server(this);
  }

  handle(request, output) {
    console.log(request.url);
    return this.router.resolve({ pathname: request.url }).then(html => {
      output.write(html);
    });
  }
};
