type dom

@module("htmlparser2")
external parseDOM: string => array<dom> = "parseDOM"

@val external getElementsByTagName: (string, array<dom>) => array<dom> = "Htmlparser2.DomUtils.getElementsByTagName"

@val external replaceElement: (dom, dom) => unit = "Htmlparser2.DomUtils.replaceElement"

@val external getOuterHTML: array<dom> => string = "Htmlparser2.DomUtils.getOuterHTML"

@val external getInnerHTML: dom => string = "Htmlparser2.DomUtils.getInnerHTML"

@val external getText: dom => string = "Htmlparser2.DomUtils.getText"

@val external hasAttrib: (dom, string) => bool = "Htmlparser2.DomUtils.hasAttrib"

@val external getAttributeValue: (dom, string) => string = "Htmlparser2.DomUtils.getAttributeValue"
