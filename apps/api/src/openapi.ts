import { OpenAPIGenerator } from "@orpc/openapi";
import { OpenAPIHandler } from "@orpc/openapi/node";
import { CORSPlugin } from "@orpc/server/plugins";
import {
  experimental_ZodSmartCoercionPlugin as ZodSmartCoercionPlugin,
  ZodToJsonSchemaConverter,
} from "@orpc/zod/zod4";

import { router } from "./router";

export const openAPIHandler = new OpenAPIHandler(router, {
  plugins: [new CORSPlugin(), new ZodSmartCoercionPlugin()],
});

const generator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
});

export function generateSpec() {
  return generator.generate(router, {
    info: {
      title: "Koshary House API",
      version: "1.0.0",
      description:
        "Online food ordering API — menu, orders, payments and admin.",
    },
    servers: [{ url: "/api/v1" }],
  });
}

export const scalarHtml = `<!doctype html>
<html>
  <head>
    <title>Koshary House API</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <div id="app"></div>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
    <script>
      Scalar.createApiReference('#app', {
        url: '/spec.json',
        theme: 'kepler',
      });
    </script>
  </body>
</html>`;
