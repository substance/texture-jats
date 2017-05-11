/*
  TextNodes contain text and annotations (i.e. in XSD `mixed=true`)
*/
export default
class TextNodeConverter {

  constructor(type) {
    this.type = type
  }

  import(el, node, converter) {
    node.content = converter.annotatedText(el, [node.id, 'content'])
  }

  export(node, el, converter) {
    el.setAttributes(node.attributes)
    el.append(converter.annotatedText([node.id, 'content']))
  }

}
