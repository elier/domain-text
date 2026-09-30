# DomainText v0.1 Specification

DomainText is a compact Domain Modeling DSL for describing software entities, relationships, inheritance, and ownership.

It is optimized for humans and LLM agents, not diagram rendering.

## Goals

- Describe domain models in very little text.
- Avoid UML noise.
- Avoid `class`, `abstract`, tags, stereotypes, and separate relationship blocks.
- Infer relationships from fields and types.
- Support most practical class/domain modeling needs.

## Core Syntax

```txt
Entity(field, field, field)
Entity(field: Type, field?: Type, items: Type[])
Child(extra_field, extra_ref: Type) < Parent
```

## Entity Declaration

```txt
Person(id, first_name, last_name, email?)
```

`Person` has fields:

- `id`
- `first_name`
- `last_name`
- `email`, optional

## Untyped Fields

```txt
Installation(id, key, name, date)
```

Untyped fields are scalars.

Agents may infer common scalar meaning:

| Field name | Suggested meaning |
|---|---|
| `id` | identifier |
| `date` | date or datetime |
| `timestamp` | datetime |
| `email` | email/string |
| `name` | string |
| `key` | string/token |

These are suggestions only. DomainText does not require scalar types.

## Optional Fields

```txt
email?
person: Person?
```

`?` means zero or one.

## Typed Fields

```txt
owner: Person
```

If `Person` is declared as an entity, this is a relationship.

If the type is not declared, treat it as scalar or external.

```txt
Order(id: UUID, date: Date, total: Money)
```

## Collections

```txt
members: Person[]
events: Event[]
```

`[]` means zero or many.

## Ownership / Composition

```txt
events: Event[]!
profile: Profile!
```

`!` means lifecycle ownership / composition.

Use it when the child belongs to the parent lifecycle.

Example:

```txt
Order(id, lines: OrderLine[]!)
OrderLine(product: Product, quantity, price)
Product(id, sku, name)
```

Meaning:

- `Order` owns `OrderLine[]`.
- `OrderLine` references `Product`.
- `Product` is not owned by `OrderLine`.

## Inheritance

```txt
Child(extra_fields) < Parent
```

Example:

```txt
Party(id)
Person(first_name, last_name, email?) < Party
Organization(name) < Party
Team(owner: Person) < Organization
```

Meaning:

- `Person` inherits `Party`.
- `Organization` inherits `Party`.
- `Team` inherits `Organization`.
- `Team` also indirectly inherits `Party`.

## Composite Pattern

Use a base type as the child collection type.

```txt
Party(id)
Person(first_name, last_name) < Party
Organization(name, children: Party[]!) < Party
Team(owner: Person) < Organization
```

This models:

- `Person` as a leaf.
- `Organization` as a composite.
- `Team` as a specialized composite organization.

## Multiplicity

| Syntax | Meaning |
|---|---|
| `Type` | required one |
| `Type?` | optional one |
| `Type[]` | zero or many |
| `Type[]!` | zero or many, owned |
| `Type!` | required one, owned |

Treat `Type[]?` as equivalent to `Type[]`.

## Comments

```txt
# This is a comment
Installation(id, key, events: Event[]!)
```

Comments start with `#` and run to the end of the line.

## Relationship Inference

Given:

```txt
Team(owner: Person)
```

Infer:

```txt
Team references one Person through owner
```

Given:

```txt
Installation(events: Event[]!)
```

Infer:

```txt
Installation owns many Event through events
```

Given:

```txt
User(person: Person?)
```

Infer:

```txt
User optionally references Person through person
```

## Normalized Internal Model

A parser should normalize each entity to this shape:

```json
{
  "name": "Team",
  "inherits": "Organization",
  "fields": [
    {
      "name": "owner",
      "type": "Person",
      "optional": false,
      "many": false,
      "owned": false,
      "kind": "reference"
    }
  ]
}
```

Field `kind` should be:

- `scalar` for untyped fields or fields whose type is not a declared entity.
- `reference` for typed fields whose type is a declared entity and are not owned.
- `composition` for typed fields whose type is a declared entity and are owned.

## Error Recovery

Agents should tolerate:

- Extra spaces.
- Blank lines.
- Trailing commas.
- Minor casing differences.
- Obvious typos when safe, such as `ower` -> `owner`.

Agents should not silently change domain meaning.

If a line cannot be parsed, return a validation error with the line number and a suggested correction.
