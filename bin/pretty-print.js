const tools = require('../tmp/tools')
const fs = require('fs')

const classificationFile = process.argv[2]
const xmlFile = process.argv[3]

let classification = fs.readFileSync(classificationFile, 'utf8')
let xmlStr = fs.readFileSync(xmlFile, 'utf8')

console.log(tools.prettyPrint(JSON.parse(classification), xmlStr))