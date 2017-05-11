/*
  StructuredNodes have attributes and children.
*/
export default
class StructuredNodeConverter {

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
