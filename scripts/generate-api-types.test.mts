import assert from "node:assert/strict";
import test from "node:test";
import { type OpenApiDocument, openApiToTypeScript } from "./generate-api-types.mts";

test("OpenAPI スキーマのプリミティブ・Union・参照・オブジェクトを決定論的に変換する", () => {
  const spec: OpenApiDocument = {
    paths: {
      "/api/items": {
        get: {
          parameters: [
            { name: "limit", in: "query", required: false, schema: { type: "integer" } },
          ],
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Item" },
                  },
                },
              },
            },
          },
        },
        post: {
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateItem" },
              },
            },
          },
          responses: {
            "204": {},
          },
        },
      },
    },
    components: {
      schemas: {
        CreateItem: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string" },
            note: { anyOf: [{ type: "string" }, { type: "null" }] },
            role: { enum: ["admin", "user"] },
          },
        },
        Item: {
          type: "object",
          required: ["id", "status"],
          properties: {
            id: { type: "string" },
            status: { const: "active", type: "string" },
            meta: { type: "object", additionalProperties: { type: "string" } },
          },
        },
      },
    },
  };

  const first = openApiToTypeScript(spec);
  const second = openApiToTypeScript(spec);

  assert.equal(first, second);
  assert.equal(first.includes("\r\n"), false);
  assert.match(first, /"/);
  assert.match(first, /note\?: string \| null;/);
  assert.match(first, /role\?: "admin" \| "user";/);
  assert.match(first, /status: "active";/);
  assert.match(first, /\[key: string\]: string;/);
  assert.match(first, /"application\/json": Array<components\["schemas"\]\["Item"\]>;/);
  assert.match(first, /requestBody: \{/);
  assert.match(first, /204: \{\s+content\?: never;\s+\};/);
});
