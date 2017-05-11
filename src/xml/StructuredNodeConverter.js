/*
  StructuredNodes have attributes and children.
*/
export default
class StructuredNodeConverter {

  constructor(type) {
    this.type = type
  }

  import(el, node, converter) {
    let it = converter.getChildNodeIterator(el)
    let childNodes = []
    while(it.hasNext()) {
      const childEl = it.next()
      let childNode = converter.convertElement(childEl)
      childNodes.push(childNode.id)
    }
    node.childNodes = childNodes
  }

  export(node, el, converter) {
    const doc = node.getDocument()
    el.setAttributes(node.attributes)
    el.childNodes.forEach((id) => {
      let childNode = doc.get(id)
      let childEl = converter.convertNode(childNode)
      el.appendChild(childEl)
    })
  }

}
