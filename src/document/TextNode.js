import { DocumentNode } from 'substance'

export default
class TextNode extends DocumentNode {

  getTextPath() {
    // TODO: deprecate this
    // console.warn('DEPRECATED: use node.getPath()')
    return this.getPath()
  }

  getPath() {
    return [this.id, 'content']
  }

  getText() {
    return this.content
  }

  isEmpty() {
    return !this.content
  }

  getLength() {
    return this.content.length
  }

}

TextNode.isText = true

TextNode.type = 'text'

TextNode.schema = {
  attributes: { type: 'object', default: {} },
  content: "text"
}