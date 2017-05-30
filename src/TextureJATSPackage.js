import TextureDocument from './document/TextureDocument'
import TextNode from './document/TextNode'
import TextNodeConverter from './document/TextNodeConverter'
import ElementNode from './document/ElementNode'
import ElementNodeConverter from './document/ElementNodeConverter'
import AnnotationNode from './document/AnnotationNode'
import AnnotationNodeConverter from './document/AnnotationNodeConverter'
import AnchorNode from './document/AnchorNode'
import AnchorNodeConverter from './document/AnchorNodeConverter'
import InlineElementNode from './document/InlineElementNode'
import InlineElementNodeConverter from './document/InlineElementNodeConverter'
import ExternalNode from './document/ExternalNode'
import ExternalNodeConverter from './document/ExternalNodeConverter'
import TextureJATS from './jats/TextureJATS'
import TextureJATSImporter from './document/TextureJATSImporter'

export default {
  name: 'TextureJATS',
  configure(config) {
    registerSchema(config)
  }
}

function registerSchema(config) {
  const xmlSchema = TextureJATS
  const schemaName = 'TextureJATS'
  // schema declaration
  config.defineSchema({
    name: schemaName,
    version: '1.1',
    DocumentClass: TextureDocument,
    defaultTextType: 'p'
  })
  const tagNames = xmlSchema.getTagNames()
  // add node definitions and converters
  tagNames.forEach((tagName) => {
    const element = xmlSchema.getElementSchema(tagName)
    let NodeClass, ConverterClass
    switch (element.type) {
      case 'element':
      case 'hybrid': {
        NodeClass = ElementNode
        ConverterClass = ElementNodeConverter
        break
      }
      case 'text': {
        NodeClass = TextNode
        ConverterClass = TextNodeConverter
        break
      }
      case 'annotation': {
        NodeClass = AnnotationNode
        ConverterClass = AnnotationNodeConverter
        break
      }
      case 'anchor': {
        NodeClass = AnchorNode
        ConverterClass = AnchorNodeConverter
        break
      }
      case 'inline-element': {
        NodeClass = InlineElementNode
        ConverterClass = InlineElementNodeConverter
        break
      }
      case 'external': {
        NodeClass = ExternalNode
        ConverterClass = ExternalNodeConverter
        break
      }
      default:
        throw new Error('Illegal state')
    }
    // anonymous class definition
    class Node extends NodeClass {}
    Node.type = element.name
    config.addNode(Node)
    let converter = new ConverterClass(element.name)
    config.addConverter(schemaName, converter)
  })

  config.addImporter('TextureJATS', TextureJATSImporter)
}