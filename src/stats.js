// figure out 'problematic' specifications
// ATM by counting hybrid nodes
import vfs from '../tmp/vfs'
import compileXSD from '../src/xsd/compileXSD'
import printInfo from '../src/printInfo'
import fs from 'fs'

const JATS11 = vfs.readFileSync('data/xsd/JATS-archive-oasis-article1-mathml3-elements.xsd')
const JATSR = vfs.readFileSync('data/xsd/JATS-r.xsd')

const JATS11xsd = compileXSD(JATS11, { debug: true })
const JATSRxsd = compileXSD(JATSR, { debug: true })

// Structure (i.e. parent + children for each element)
fs.writeFileSync('proposal/STRUCTURE-JATS.md',
  printInfo({ schema: JATS11xsd, structure: true })
)
fs.writeFileSync('proposal/STRUCTURE-JATS-R.md',
  printInfo({ schema: JATSRxsd, structure: true })
)

// Classification (i.e. Text, Structure, Annotation, Hybrid)
fs.writeFileSync('proposal/CLASSIFICATION-JATS.md',
  printInfo({ schema: JATS11xsd, classification: true })
)
fs.writeFileSync('proposal/CLASSIFICATION-JATS-R.md',
  printInfo({ schema: JATSRxsd, classification: true })
)
