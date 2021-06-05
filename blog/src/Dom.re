type dom;
type util;
[@bs.module "htmlparser2"]
external parseDOM: string => array(dom) = "parseDOM";

module DomUtils = {
  type t;

  [@bs.module "htmlparser2"] [@bs.val] [@bs.scope "DomUtils"]
  external getElementsByTagName: (string, array(dom)) => array(dom) =
    "getElementsByTagName";
  [@bs.module "htmlparser2"] [@bs.val] [@bs.scope "DomUtils"]
  external replaceElement: (dom, dom) => unit = "replaceElement";
  [@bs.module "htmlparser2"] [@bs.val] [@bs.scope "DomUtils"]
  external getOuterHTML: array(dom) => string = "getOuterHTML";
  [@bs.module "htmlparser2"] [@bs.val] [@bs.scope "DomUtils"]
  external getInnerHTML: dom => string = "getInnerHTML";
  [@bs.module "htmlparser2"] [@bs.val] [@bs.scope "DomUtils"]
  external getText: dom => string = "getText";

  [@bs.module "htmlparser2"] [@bs.val] [@bs.scope "DomUtils"]
  external hasAttrib: (dom, string) => bool = "hasAttrib";

  [@bs.module "htmlparser2"] [@bs.val] [@bs.scope "DomUtils"]
  external getAttributeValue: (dom, string) => string = "getAttributeValue";
};
