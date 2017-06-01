import {
    IncrementalData, Document,
    PropertyIndex, AnnotationIndex,
    DocumentNodeFactory
} from 'substance'

import TextureJATS from '../jats/TextureJATS'
import ParentNodeHook from './ParentNodeHook'

export default
class JATSDocument extends Document {

  _initialize() {
    this.nodeFactory = new DocumentNodeFactory(this)
    this.data = new IncrementalData(this.schema, this.nodeFactory)
    // all by type
    this.addIndex('type', new PropertyIndex('type'))
    // special index for (property-scoped) annotations
    this.addIndex('annotations', new AnnotationIndex())

    ParentNodeHook.register(this)
  }

  getXMLSchema() {
    return TextureJATS
  }

  getXRefs() {
    let articleEl = this.get('article')
    // this traverses the article in the same way as css-select
    return articleEl.findAll('xref')
  }

}