# DomainText

DomainText is a compact Domain Modeling DSL for describing software entities, relationships, inheritance, and ownership.

This repository includes the language specification, formal grammar, normalized JSON schema, reference parser, examples, tests, and an agent-agnostic skill for working with DomainText.

## Example

A university domain can be expressed in a few lines:

```txt
Person(id, name, email?)
Student(student_number, enrollments: Enrollment[]!) < Person
Instructor(employee_number) < Person
Course(id, code, title, instructor: Instructor)
Enrollment(id, course: Course, enrolled_at, grade?)
```

## UML Compatibility

DomainText does not currently represent the full UML model. Missing features include methods, visibility, abstract classes, interfaces, packages, stereotypes, bidirectional associations, explicit ranges such as `1..*`, association classes, qualifiers, and constraints.

## Project Contents

- [`references/domaintext-spec.md`](references/domaintext-spec.md): language specification.
- [`references/grammar.ebnf`](references/grammar.ebnf): formal grammar.
- [`references/normalized-schema.json`](references/normalized-schema.json): normalized JSON schema.
- [`scripts/parse-domaintext.mjs`](scripts/parse-domaintext.mjs): reference parser.
- [`references/examples.md`](references/examples.md): example models and interpretations.
- [`tests/`](tests): parser fixture and expected output.
- [`SKILL.md`](SKILL.md): agent-agnostic skill instructions.

## Reference Parser

Run the parser with Node.js:

```bash
node scripts/parse-domaintext.mjs tests/sample.dt
```

## Tests

```bash
diff -u tests/expected.json <(node scripts/parse-domaintext.mjs tests/sample.dt)
```

No output means the parser produced the expected result.

## Agent Skill

`SKILL.md` teaches compatible agents to write, parse, validate, explain, and transform DomainText models.

Copy this repository into the skill, capability, or custom-instructions directory used by your agent. Keep `SKILL.md`, `references/`, `scripts/`, and `tests/` together.

Common locations:

| Agent | Example install path |
|---|---|
| Codex | `~/.codex/skills/domain-text` |
| Claude Code | `~/.claude/skills/domain-text` |
| Other agents | The agent's configured skills or instructions directory |

For example:

```bash
mkdir -p ~/.codex/skills
cp -R . ~/.codex/skills/domain-text
```

Once installed, agents that support skill discovery should recognize DomainText syntax and load the skill for matching tasks.

## Author

Elier Delgado, Innova Montreal Inc.

## License

DomainText is available under the [MIT License](LICENSE).
