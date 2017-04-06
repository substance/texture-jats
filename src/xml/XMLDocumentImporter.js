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
class XMLDocumentImporter {

}