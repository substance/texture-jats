import { DocumentNode } from 'substance'

export default
class AnchorNode extends DocumentNode {}

AnchorNode.type = 'anchor'

AnchorNode.schema = {
  attributes: { type: 'object', default: {} },
  coor: { type: "coordinate", optional: true }
}
