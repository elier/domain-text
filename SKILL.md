---
name: domain-text
description: >-
  Use DomainText, a compact Domain Modeling DSL, to write, edit, validate,
  parse, explain, or generate software domain models such as
  Entity(id, ref: Other[], owned: Child[]!) or Child(extra_field) < Parent.
  Converts between DomainText, normalized JSON, code, database schemas,
  and documentation.
---

# DomainText Skill

DomainText is a compact Domain Modeling DSL for describing software entities, relationships, inheritance, and ownership.

Use this skill when the user provides or requests compact domain syntax like:

```txt
Person(id, name, email?)
Student(student_number, enrollments: Enrollment[]!) < Person
Instructor(employee_number) < Person
Course(id, code, title, instructor: Instructor)
Enrollment(id, course: Course, enrolled_at, grade?)
```

## Core Principle

Prefer relationships expressed as fields, not separate relationship lines.

Use this:

```txt
Student(id, enrollments: Enrollment[]!)
Course(id, instructor: Instructor)
```

Avoid this unless the user explicitly asks for a visual/UML representation:

```txt
Student owns Enrollment[]
Course instructor -> Instructor
```

## Minimal Syntax

```txt
Entity(field, field?, ref: Entity, items: Entity[])
Child(extra_field, extra_ref: Entity) < Parent
field: Type! means owned / lifecycle-bound
field: Type[] means many
field? means optional scalar
field: Type? means optional reference
```

## Meaning

- `Entity(...)` declares an entity.
- `Child(...) < Parent` declares inheritance; the fields belong to `Child`.
- `field` without a type is a scalar field.
- `field?` is optional.
- `field: Type` references another entity when `Type` is declared; otherwise it is a scalar/external type.
- `field: Type[]` is many.
- `field: Type!` or `field: Type[]!` means owned / composition / lifecycle-bound.

## Inference Rules

Infer relationships from typed fields:

```txt
Course(instructor: Instructor)
```

means `Course` references one `Instructor`.

```txt
Student(enrollments: Enrollment[]!)
```

means `Student` owns many `Enrollment` records.

```txt
GraduateStudent(thesis_title?) < Student
```

means `GraduateStudent` inherits from `Student` and adds `thesis_title`.

## Defaults

- Untyped fields are scalar.
- `Type` is required one.
- `Type?` is optional one.
- `Type[]` is zero or many.
- `Type[]!` is zero or many and owned.
- Empty collection already means optional; treat `Type[]?` as `Type[]`.

## Naming

Prefer:

```txt
EntityName      PascalCase
field_name      snake_case
```

Normalize obvious user input:

```txt
first name -> first_name
ower -> owner
install_id -> installation_id
```

Do not over-normalize domain terms without user confirmation if the meaning could change.

## Comments

Ignore comments beginning with `#`.

```txt
# University student record
Student(id, name, email?)
```

## Agent Behavior

When asked to parse DomainText:

1. Read one declaration per line.
2. Ignore blank lines and comments.
3. Detect inheritance using `<`.
4. Parse fields inside parentheses.
5. Mark optional fields using `?`.
6. Mark collections using `[]`.
7. Mark owned/composition fields using `!`.
8. Resolve typed fields against declared entities.
9. Infer relationships from typed fields.
10. Return normalized JSON unless the user asks for another output.

When asked to write DomainText:

- Keep it compact.
- Do not use `class`, `abstract`, tags, UML stereotypes, or separate relation lines unless asked.
- Prefer fields to express relations.
- Use inheritance only with `<`.
- Use ownership only when lifecycle matters.

When asked to generate code/database schemas:

- Parse to normalized JSON first.
- Apply inherited fields recursively.
- Treat owned fields as composition/child lifecycle.
- Treat non-owned typed fields as references.
- Ask at most one clarifying question only when generation would be materially wrong without it; otherwise make a reasonable assumption and state it.

## Canonical Example

```txt
Person(id, name, email?)
Student(student_number, enrollments: Enrollment[]!) < Person
Instructor(employee_number) < Person
Course(id, code, title, instructor: Instructor)
Enrollment(id, course: Course, enrolled_at, grade?)
```

Inferred relationships:

```txt
Student inherits Person
Instructor inherits Person
Student owns many Enrollment records
Course references one Instructor
Enrollment references one Course
```

## Reference Files

Use the bundled references when needed:

- `references/domaintext-spec.md` — full human-readable specification.
- `references/grammar.ebnf` — formal grammar.
- `references/normalized-schema.json` — normalized JSON schema.
- `references/examples.md` — examples and expected interpretations.
- `scripts/parse-domaintext.mjs` — deterministic parser reference implementation.
