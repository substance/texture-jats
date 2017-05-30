import {
    IncrementalData, Document,
    PropertyIndex, AnnotationIndex,
    DocumentNodeFactory
} from 'substance'

export default
class JATSDocument extends Document {

  _initialize() {
    this.nodeFactory = new DocumentNodeFactory(this)
    this.data = new IncrementalData(this.schema, this.nodeFactory)
    // all by type
    this.addIndex('type', new PropertyIndex('type'))
    // special index for (property-scoped) annotations
    this.addIndex('annotations', new AnnotationIndex())
  }

}