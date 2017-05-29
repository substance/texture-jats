
/*
  In JATS 1.1 it is allowed to have block level elements inside of `<p>`.
  We split these paragraphs, inserting new block-level elements.
*/
export default function pBlock(article) {
  article.findAll('p').forEach(_transform)
}

// TODO: add all of them
const BLOCKS = ['fig', 'fig-group', 'media']
const isBlock = BLOCKS.reduce((m, n) => { m[n] = true; return m}, {})

function _transform(p) {
  let parent = p.parentNode
  let children = p.children
  let L = children.length
  // doing it reverse so that we don't miss elements due to the ongoing tranformations
  for (var i = L - 1; i >= 0; i--) {
    let child = children[i]
    if (isBlock[child.tagName]) {
      // create a new <p>
      let newP = parent.createElement('p')
      let childPos = p.getChildIndex(child)
      let siblings = p.childNodes.slice(childPos+1)
      // move all subsequent siblings to the new <p>
      // and insert the block element and the new one after the current <p>
      let pos = parent.getChildIndex(p)+1
      parent.insertAt(pos, child)
      if (siblings.length > 0) {
        newP.append(siblings)
        parent.insertAt(pos+1, newP)
      }
    }
  }
}