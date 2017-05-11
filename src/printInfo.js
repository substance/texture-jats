import { forEach } from 'substance'
import vfs from 'vfs'
import compileXSD from './xsd/compileXSD'

export default function printInfo(options={}) {
  let xsd = vfs.readFileSync('data/xsd/JATS-archive-oasis-article1-mathml3-elements.xsd')
  let schema = compileXSD(xsd, 'debug')
  let parents = {}
  let children = {}
  // the first is a pseudo entry EPSILON
  const elements = schema.slice(1)
  const tagNames = schema.map(e=>e.name)
  elements.forEach((e) => {
    children[e.name] = {}
    forEach(e.dfa, (ts) => {
      forEach(ts, t => {
        t.forEach((idx) => {
          const tName = tagNames[idx]
          if (!tName || tName === 'EPSILON') return
          parents[tName] = parents[tName] || {}
          parents[tName][e.name] = true
          children[e.name][tName] = true
        })
      })
    })
  })

  let str = []
  elements.forEach((e)=>{
    const name = e.name
    if (options.hybridOnly) {
      if(e.hybridBecause) {
        str.push(name)
      }
      return
    }
    str.push(`# &lt;${name}&gt; [spec](https://jats.nlm.nih.gov/archiving/tag-library/1.1/element/${name}.html)`)
    str.push('')

    // render categories and info about why a node is considered 'hybrid',
    // i.e. used as inline and block-level node
    if (options.classification) {
      if (e.categories) {
        str.push(`- categories: ${Object.keys(e.categories)}`)
        str.push('')
      }
      if (e.hybridBecause) {
        str.push('  considered as hybrid because: ' + e.hybridBecause)
        str.push('')
      }
    }

    if (options.structure) {
      // children
      let c = children[name] || {}
      c = Object.keys(c)
      c.sort()
      if (e.mixed) {
        c.unshift('TEXT')
      }
      if (c.length) {
        str.push('- children:')
        str.push('')
        str.push('  ' + c.join(', '))
        str.push('')
      }

      // parents
      let p = parents[name] || {}
      p = Object.keys(p)
      p.sort()
      if (p.length) {
        str.push('- parents:')
        str.push('')
        str.push('  ' + p.join(', '))
        str.push('')
      }
    }
  })
  return str.join('\n')
}
