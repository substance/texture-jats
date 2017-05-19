import { DefaultDOMElement, DOMImporter, map } from 'substance'
import JATS from '../JATS'
import Validator from '../common/Validator'
import XMLAnnotationConverter from './XMLAnnotationConverter'

export default
class JATSImporter extends DOMImporter {

  constructor(config, context) {
    super({
      idAttribute: 'id',
      schema: config.getSchema(),
      // HACK: usually we use configurator.createImporter()
      converters: map(config.config.converters.jats, val=>val)
    }, context)

    this.validator = new Validator(JATS)
  }

  importDocument(xml) {
    this.reset()
    let dom = DefaultDOMElement.parseXML(xml)
    let articleEl = dom.find('article')
    if (!articleEl) throw new Error('Could not find <article> element.')
    this.convertElement(articleEl)
    return this.state.doc
  }

  _initialize() {
    const schema = this.schema
    const defaultTextType = schema.getDefaultTextType()
    const converters = this.converters

    this._allConverters = []
    this._propertyAnnotationConverters = []
    this._blockConverters = []

    for (let i = 0; i < converters.length; i++) {
      let converter
      if (typeof converters[i] === 'function') {
        const Converter = converters[i]
        converter = new Converter()
      } else {
        converter = converters[i]
      }
      if (!converter.type) {
        throw new Error('Converter must provide the type of the associated node.')
      }
      if (!converter.matchElement && !converter.tagName) {
        throw new Error('Converter must provide a matchElement function or a tagName property.')
      }
      if (!converter.matchElement) {
        converter.matchElement = this._defaultElementMatcher.bind(converter)
      }
      const NodeClass = schema.getNodeClass(converter.type)
      if (!NodeClass) {
        throw new Error('No node type defined for converter')
      }
      if (!this._defaultBlockConverter && defaultTextType === converter.type) {
        this._defaultBlockConverter = converter
      }

      // TODO: need to rethink this
      this._allConverters.push(converter)
      if (NodeClass.isHybrid) {
        let hybridConverter = new XMLAnnotationConverter()
        hybridConverter.tagName = NodeClass.type
        this._propertyAnnotationConverters.push(hybridConverter)
        this._blockConverters.push(converter)
      } else if (NodeClass.isAnnotation) {
        this._propertyAnnotationConverters.push(converter)
      } else {
        this._blockConverters.push(converter)
      }
    }
    if (!this._defaultBlockConverter) {
      throw new Error(`No converter for defaultTextType ${defaultTextType}`)
    }
  }

  _createNodeData(el, type) {
    let nodeData = super._createNodeData(el, type)
    let attributes = {}
    el.getAttributes().map((value, key) => {
      attributes[key] = value
    })
    nodeData.attributes = attributes
    return nodeData
  }

  getChildNodeIterator(el) {
    return this.validator.getValidatingChildNodeIterator(el)
  }

}
