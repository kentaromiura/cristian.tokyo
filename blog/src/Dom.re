type dom;
type util;
[@bs.module "htmlparser2"] external parseDOM: string => array(dom) = "";

module DomUtils = {
  type t;

  [@bs.module "htmlparser2"] [@bs.val] [@bs.scope "DomUtils"]
  external getElementsByTagName: (string, array(dom)) => array(dom) = "";
  [@bs.module "htmlparser2"] [@bs.val] [@bs.scope "DomUtils"]
  external replaceElement: (dom, dom) => unit = "";
  [@bs.module "htmlparser2"] [@bs.val] [@bs.scope "DomUtils"]
  external getOuterHTML: array(dom) => string = "";
  [@bs.module "htmlparser2"] [@bs.val] [@bs.scope "DomUtils"]
  external getInnerHTML: dom => string = "";
  [@bs.module "htmlparser2"] [@bs.val] [@bs.scope "DomUtils"]
  external getText: dom => string = "";

  [@bs.module "htmlparser2"] [@bs.val] [@bs.scope "DomUtils"] 
  external hasAttrib: (dom, string) => bool = "";

  [@bs.module "htmlparser2"] [@bs.val] [@bs.scope "DomUtils"] 
  external getAttributeValue: (dom, string) => string = "";
};