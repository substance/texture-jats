import JATSDocument from './JATSDocument'
import TextNode from './TextNode'
import TextNodeConverter from './TextNodeConverter'
import ElementNode from './ElementNode'
import ElementNodeConverter from './ElementNodeConverter'
import AnnotationNode from './AnnotationNode'
import AnnotationNodeConverter from './AnnotationNodeConverter'
import AnchorNode from './AnchorNode'
import AnchorNodeConverter from './AnchorNodeConverter'
import InlineElementNode from './InlineElementNode'
import InlineElementNodeConverter from './InlineElementNodeConverter'
import ExternalNode from './ExternalNode'
import ExternalNodeConverter from './ExternalNodeConverter'
import restrictedJATS from '../rng/restrictedJATS'
import deserializeSchema from '../schema/deserializeSchema'

export default {
  name: 'restJATS',
  configure(config) {
    registerSchema(config)
  }
}

function registerSchema(config) {
  const xmlSchema = deserializeSchema(restrictedJATS)
  const schemaName = 'restrictedJATS'
  // schema declaration
  config.defineSchema({
    name: schemaName,
    version: '1.1',
    DocumentClass: JATSDocument,
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
}