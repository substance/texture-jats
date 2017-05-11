import { DefaultDOMElement, DOMImporter } from 'substance'
import JATSDocument from './JATSDocument'

/*
  We want to reuse DOMImporter, but...

  - with a different way to do block-level vs inline node detection
  - fixed set of converters which do not need to get looked up
    ... should be clear from the schema

  - we need to distinguish between different types:

    1. Purely structural nodes, such as `<front>`,  `<abstract>`
    2. Inline nodes, such as `<inline-graphic>`
    3. Annotations, such as `<bold>`

    There is a number of tags where the specification is very unspecific:
    e.g. `<abbrev>` can contain almost the same as `<bold>`, without `<br>` but with `<dev>`
*/

export default
class JATSImporter extends DOMImporter {

  constructor(config, context) {
    super({
      idAttribute: 'id',
      schema: config.getSchema(),
      converters: []
    }, context)
  }

  _initialize() {
    // register converters
    // NOTE: atm we do not support custom converters
    // but we might want to allow that later on
  }

  _getConverterForElement(el, mode) {
    // 'mode' is either 'inline' or 'block'
    //
  }

  importDocument(xml) {
    let dom = DefaultDOMElement.parseXML(xml)
    let doc = new JATSDocument(config.getSchema())
    let articleEl = dom.find('article')
    if (!articleEl) throw new Error('Could not find <article> element.')
    this.importElement(doc, articleEl)
  }

  importElement(doc, el) {
  }

}
