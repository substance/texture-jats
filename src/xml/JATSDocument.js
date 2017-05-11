import {
    IncrementalData, Document,
    PropertyIndex, AnnotationIndex
} from 'substance'
import XMLNodeFactory from './XMLNodeFactory'

export default
class JATSDocument extends Document {

  _initialize() {
    this.nodeFactory = new XMLNodeFactory(this)
    this.data = new IncrementalData(this.schema, this.nodeFactory)

    // all by type
    this.addIndex('type', new PropertyIndex('type'))
    // special index for (property-scoped) annotations
    this.addIndex('annotations', new AnnotationIndex())
  }

}