'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (babel) {
  var t = babel.types;


  var removeFromBody = function removeFromBody(path) {
    return path.parent.body = path.parent.body.filter(function (x) {
      return x != path.node;
    });
  };

  var moveOther = function moveOther(path) {
    var set = babel.transform('this.' + path.node.key.name + ' = 0');
    var assignment = set.ast.program.body[0];
    // easier to override like this ;)
    assignment.expression.right = path.node.value;

    var ctr = path.parent.body.find(function (x) {
      return x.kind === 'constructor';
    });
    ctr.body.body.splice(ctr.body.body.length - 1, 0, assignment);

    removeFromBody(path);
  };
  var toDash = function(name) {
      var lower = name.toLowerCase();
      var output = [lower[0]];
      for(var i=1, max=lower.length; i<max; i++) {
          var c = lower[i];
          if (c === name[i]) {
            output.push(c);
          } else {
            output.push('-', c);
          }
      }
      return output.join('');
  }
  var appendDefine = function appendDefine(path) {
    var name = path.node.id.name;
    var register = babel.transform('customElements.define(\'hyper-' + toDash(name) + '\', ' + name + ')');
    path.parent.body.splice(path.parent.body.findIndex(function (x) {
      return x === path.node;
    }) + 1, 0, register.ast.program.body[0]);
  };

  var moveRender = function moveRender(path) {
    var isFragment = path.node.value.openingElement.name.name === 'fragment';
    path.path.traverse({
      JSXExpressionContainer: function JSXExpressionContainer(path, context) {
        var _code = babel.transformFromAst(t.file(t.program([t.expressionStatement(path.node.expression)]))).code;
        _code = _code.substring(0, _code.length - 1);
        if (!path.inList) {
          path.parent.value = t.stringLiteral('${' + _code.replace(/\n/g, '') + '}');
        } else {
          var idx = path.parent[path.listKey].indexOf(path.node)
          path.parent[path.listKey][idx] = t.stringLiteral('${' + _code.replace(/\n/g, '') + '}');
        }
      }
    });
    var code = babel.transformFromAst(t.file(t.program([t.expressionStatement(path.node.value)]))).code;

    // TODO: if name=fragment ... else
    code = code.substring(0, code.length - 1);
    if (isFragment) {
      code = code.substring(10, code.length - 11);
    }
    path.parent.body.push(babel.transform('class _{render(){ return this._render`' + code + '`}}').ast.program.body[0].body.body[0]

    // remove node
    );removeFromBody(path);
  };
  var params = [t.restElement(t.identifier('rest'))];

  var addConstructor = function addConstructor(path) {
    path.node.body.body.push(babel.transform('class X{constructor(...args){super(...args); this._render = hyperHTML.bind(this); this.render()}}').ast.program.body[0].body.body[0]);
  };

  return {
    name: "ast-transform", // not required
    visitor: {
      ClassDeclaration: function ClassDeclaration(path) {
        var sc = path.node.superClass;
        if (sc && sc.property.name === 'Component' && sc.object.name === 'hyperHTML') {
          addConstructor(path);
          path.traverse({
            ClassProperty: function ClassProperty(p) {
              var item = p.node;
              if (item.type === 'ClassProperty') {
                if (item.key.name === 'render') {
                  moveRender({ node: item, parent: path.node.body, path: p });
                } else {
                  moveOther({ node: item, parent: path.node.body });
                }
              }
            }
          });
          path.node.body.body.forEach(function (item) {
            if (item.type === 'ClassProperty') {
              if (item.key.name === 'render') {
                moveRender({ node: item, parent: path.node.body });
              } else {
                moveOther({ node: item, parent: path.node.body });
              }
            }
          });
          path.node.body.body.push(babel.transform('class _{setState(state){ Object.assign(this.state, state); this.render()}}').ast.program.body[0].body.body[0]);
          appendDefine(path);
        }
      }
    }
  };
};