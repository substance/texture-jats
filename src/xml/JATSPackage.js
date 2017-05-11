import JATS from '../JATS'
import JATSDocument from './JATSDocument'
import TextNode from './TextNode'
import TextNodeConverter from './TextNodeConverter'
import StructuredNode from './StructuredNode'
import StructuredNodeConverter from './StructuredNodeConverter'
import XMLAnnotation from './XMLAnnotation'
import XMLAnnotationConverter from './XMLAnnotationConverter'
import HybridTextNode from './HybridTextNode'
import HybridTextNodeConverter from './HybridTextNodeConverter'
import HybridStructuredNode from './HybridStructuredNode'
import HybridStructuredNodeConverter from './HybridStructuredNodeConverter'

export default {
  name: 'JATS',
  configure(config) {
    defineSchema(config)
  }
}

function defineSchema(config) {
  // schema declaration
  config.defineSchema({
    name: 'jats',
    version: '1.1',
    DocumentClass: JATSDocument,
    defaultTextType: 'p'
  })
  // node definitions from XML schema
  JATS.forEach((element) => {
    if (element.name === 'EPSILON') return
    let ParentClass, ConverterClass
    if (element.categories.annotation) {
      ParentClass = XMLAnnotation
      ConverterClass = XMLAnnotationConverter
    } else if (element.categories.text) {
      if (element.categories.hybrid) {
        ParentClass = HybridTextNode
        ConverterClass = HybridTextNodeConverter
      } else {
        ParentClass = TextNode
        ConverterClass = TextNodeConverter
      }
    } else if (element.categories.structured) {
      if (element.categories.hybrid) {
        ParentClass = HybridStructuredNode
        ConverterClass = HybridStructuredNodeConverter
      } else {
        ParentClass = StructuredNode
        ConverterClass = StructuredNodeConverter
      }
    } else {
      throw new Error('Illegal state')
    }
    // anonymous class definition
    class Node extends ParentClass {}
    Node.type = element.name
    config.addNode(Node)
    config.addConverter('jats', ConverterClass)
  })
}