#!/usr/bin/env node
/**
 * DomainText v0.1 parser reference implementation.
 *
 * Usage:
 *   node scripts/parse-domaintext.mjs model.dt
 *   cat model.dt | node scripts/parse-domaintext.mjs
 */

import fs from "node:fs";

function normalizeName(name) {
  return name.trim().replace(/\s+/g, "_");
}

function stripComment(line) {
  const idx = line.indexOf("#");
  return idx >= 0 ? line.slice(0, idx) : line;
}

function splitFields(fieldsText) {
  if (!fieldsText.trim()) return [];
  return fieldsText
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseField(raw) {
  const text = raw.trim();
  if (!text) return null;

  const colonIndex = text.indexOf(":");

  if (colonIndex === -1) {
    const optional = text.endsWith("?");
    const rawName = optional ? text.slice(0, -1) : text;
    return {
      name: normalizeName(rawName),
      type: "scalar",
      optional,
      many: false,
      owned: false,
      kind: "scalar"
    };
  }

  const rawName = text.slice(0, colonIndex).trim();
  let typeExpr = text.slice(colonIndex + 1).trim();

  let owned = false;
  let many = false;
  let optional = false;

  if (typeExpr.endsWith("!")) {
    owned = true;
    typeExpr = typeExpr.slice(0, -1).trim();
  }

  if (typeExpr.endsWith("?")) {
    optional = true;
    typeExpr = typeExpr.slice(0, -1).trim();
  }

  if (typeExpr.endsWith("[]")) {
    many = true;
    optional = false;
    typeExpr = typeExpr.slice(0, -2).trim();
  }

  return {
    name: normalizeName(rawName),
    type: typeExpr || "scalar",
    optional,
    many,
    owned,
    kind: "scalar"
  };
}

function parseDeclaration(line, lineNumber) {
  const text = stripComment(line).trim();
  if (!text) return null;

  const inheritanceMatch = text.match(/^([A-Z][A-Za-z0-9_]*)\s*\((.*)\)\s*<\s*([A-Z][A-Za-z0-9_]*)\s*$/);
  if (inheritanceMatch) {
    const [, name, fieldsText, inherits] = inheritanceMatch;
    return {
      entity: {
        name,
        inherits,
        fields: splitFields(fieldsText).map(parseField).filter(Boolean)
      },
      error: null
    };
  }

  const entityMatch = text.match(/^([A-Z][A-Za-z0-9_]*)\s*\((.*)\)\s*$/);
  if (entityMatch) {
    const [, name, fieldsText] = entityMatch;
    return {
      entity: {
        name,
        inherits: null,
        fields: splitFields(fieldsText).map(parseField).filter(Boolean)
      },
      error: null
    };
  }

  return {
    entity: null,
    error: {
      line: lineNumber,
      message: "Could not parse DomainText declaration. Expected Entity(...) or Child(...) < Parent.",
      text
    }
  };
}

export function parseDomainText(input) {
  const lines = input.split(/\r?\n/);
  const entities = [];
  const errors = [];

  lines.forEach((line, index) => {
    const parsed = parseDeclaration(line, index + 1);
    if (!parsed) return;
    if (parsed.error) errors.push(parsed.error);
    if (parsed.entity) entities.push(parsed.entity);
  });

  const entityNames = new Set(entities.map((e) => e.name));
  const relationships = [];

  for (const entity of entities) {
    if (entity.inherits) {
      relationships.push({
        from: entity.name,
        to: entity.inherits,
        field: "<",
        many: false,
        optional: false,
        owned: false,
        kind: "inheritance"
      });

      if (!entityNames.has(entity.inherits)) {
        errors.push({
          line: 1,
          message: `Parent entity '${entity.inherits}' is not declared.`,
          text: `${entity.name} < ${entity.inherits}`
        });
      }
    }

    for (const field of entity.fields) {
      if (field.type !== "scalar" && entityNames.has(field.type)) {
        field.kind = field.owned ? "composition" : "reference";
        relationships.push({
          from: entity.name,
          to: field.type,
          field: field.name,
          many: field.many,
          optional: field.optional,
          owned: field.owned,
          kind: field.owned ? "composition" : "reference"
        });
      } else {
        field.kind = "scalar";
      }
    }
  }

  return {
    version: "domaintext/0.1",
    entities,
    relationships,
    errors
  };
}

function main() {
  const file = process.argv[2];
  const input = file ? fs.readFileSync(file, "utf8") : fs.readFileSync(0, "utf8");
  console.log(JSON.stringify(parseDomainText(input), null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
