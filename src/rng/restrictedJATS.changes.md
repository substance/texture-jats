3. Remove `math.class` from general phrase content

Use `<disp-formula>` and `<inline-formula>` instead.

2. Redesigning `<inline-formula>`

Similar to the changes for `<disp-formula>`.

Proposal:
```
(x | preformat | code | mml:math | tex-math | graphic | alternatives)
```

1. Redesigning `<disp-formula>`

`<disp-formula>` allows for unstructured content, probably to make it more
convenient to write manually. Instead, this element could be defined 
much more restrictively in purely structural way.

Proposal:
```
label?,
abstract*,
kwd-group*,
(alt-text | long-desc)*,
(x | preformat | code | mml:math | text-math | graphic | array | alternatives), 
(attrib | permissions)*
```

Wrap the source in some way:
- `<tex-math>`: for latex source
- `<mml:math>`: for MathML source
- `<code>`: for other source types
- `<x>`: rendered
- `<preformat>`: preformatted

```
<disp-formula>
    <preformat>f(x) = x<sup>2</sup</preformat>
</disp-formula>
```

If you want to provide multiple source-types at the same time:

```
<disp-formula>
    <alternatives>
        <textual-form>f(x) = x<sup>2</sup></textual-form>
        <code code-type="tex">f(x) = x^2</code>
        <mml:math>...</mml:math>
    </alternatives>
</disp-formula>
```

TODO: either `<alternatives>` should be generalized, or a dedicated `<formula-alternatives>` should be introduced. For the first, it would be nice to be able
to restrict the schema in a context-sensitive way.

TODO: evaluate how `<disp-formula>` is used in the wild.
A transformation would transform unstructured formulas into structured ones,
by wrapping inline content into a `<x>` element. Other structured content
would be rearranged to fulfill the proposed schema.