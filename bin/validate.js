/* globals process */

const tools = require('../tmp/tools')
const fs = require('fs')

const schemaFile = process.argv[2]
const xmlFile = process.argv[3]

let xmlSchema = tools.deserializeSchema(
  JSON.parse(fs.readFileSync(schemaFile, 'utf8'))
)
let xmlStr = fs.readFileSync(xmlFile, 'utf8')
let errors = tools.validate(xmlSchema, xmlStr)

if (errors.length > 0) {
  console.error('Errors:')
  errors.forEach( (err) => {
    console.error(err)
  })
}