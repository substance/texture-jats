/*
  HybridTextNodes are used as TextNodes, as well as annotations.
*/
export default class XMLAnnotationConverter {

  constructor(type) {
    this.type = type
  }

  import(el, node) {}

  export(node, el) {
    el.setAttributes(node.attributes)
  }

}