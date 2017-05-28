19. Restrict `<related-article>`

We want it to be used only in `<article-meta>`, and references using `<xref>`.
It should itself be a purely structural element.

18. Drop `<inline-supplementary-material>`

We want to use `<supplementary-material>` and `<xref>`, instead.

> TODO: investigate the impact of this restricting, and evolve
> a transformation for legacy.

17. Simplify `article-link.class`

We think `<xref>` is enough to create links to resources.
- `<inline-supplementary-material>`: `ref-type="supplementary-material"`
- `<related-article>`: `ref-type="related-article"`
- `<related-object>`: `ref-type="related-object"`

16. Redesign `<chem-struct>`

We want it to be used purely structurely.

> TODO: investigate the impact of this restricting, and evolve
> a transformation for legacy.

15. Redesign `<alternatives>`

In JATS 1.1. this has an inconsistent specification, 
mixing inline and block-level content

> TODO: we should evaluate how this is used and come up with an
> improved model.

14. Redesign `<sig-block>` and `<sig>`

As of JATS 1.1 `<sig>` very much 'free' form without a good structure.
It looks like `<sig>` is a very visual structure composed of lines of text
together with graphics. We would prefer to introduce a `<sig-line>` element
instead of mixing text, `<break>` and `<graphic>`.
For sake of compatibility we could use `<x>` instead of a `<sig-line>`.

> TODO: we should evaluate how this is used and come up with an
> improved model.

13. Restrict `<person-group>`

We want it to be used purely structurely.

> TODO: investigate the impact of this restricting, and evolve
> a transformation for legacy.

12. Restrict `<publisher-loc>`

This seems to be intended for textual content mainly.

> TODO: investigate the impact of this restricting, and evolve
> a transformation for legacy.

11. Restrict `<corresp>`

We want it to be used purely structurely.

> TODO: investigate the impact of this restricting, and evolve
> a transformation for legacy.

10. Restrict `<conf-loc>`

All examples in JATS 1.1 indicate that this is used primarily with textual content.

9. Redesign `<collab>`

We want it to be used purely structurely.

> TODO: investigate the impact of this restricting, and evolve
> a transformation for legacy.

8. Redesign `<aff>`

We want it to be used purely structurely.

> TODO: investigate the impact of this restricting, and evolve
> a transformation for legacy.

7. Restrict `<p>` to pure inline content

In JATS 1.1 `<p>` establishes a leak to inject block-level content
(e.g. `<fig>`) into inline content.
We are removing support for such elements, and instead splitting
a `<p>` into multiple blocks.

> TODO: To retain the same expressiveness, all parents of `<p>` should allow 
all necessary block-level types. For this we need to find out, which
of these block-level elements have defacto been used, e.g., within a `<fn>`

6. Restrict `<styled-content>` to pure inline content

> Attention: we will not support wrapping block-level content

> TODO: investigate the impact of this restriction

5. Restrict `<named-content>` to pure inline content

> Attention: we will not support wrapping block-level content

> TODO: investigate the impact of this restriction

4. Redesign citations (`<element-citation>`, `<mixed-citation>`, etc.)

`<element-citation>` should be purely structural,
not allowing for inline content.

`<mixed-citation>` is in our sense redundant to a 
combination of `<element-citation>` plus `<x>`.

Removing `<nlm-citation>`.

For compatibility with JATS 1.1 we need to transform `<mixed-citation>`
into `<element-citation>` if not present, and replace it with a `<x>`.

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