/*
  TextNodes contain text and annotations (i.e. in XSD `mixed=true`)
*/
export default
class TextNodeConverter {

  constructor(type) {
    this.type = type
  }

  import(el, node, converter) {
    node.attributes = el.getAttributes()
    // TODO: walk the childNodes using the validator
    // and convert the elements into nodes and
    // add the node ids to the node data
  }

  export(node, el, converter) {

  }

}
