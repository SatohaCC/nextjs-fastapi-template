/**
 * このファイルは `pnpm gen:api-types` により自動生成されます。直接編集しないでください。
 */

export interface paths {
  "/api/health": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": components["schemas"]["HealthResponse"];
          };
        };
      };
    };
  };
}

export interface components {
  schemas: {
    HealthResponse: {
      service: string;
      status: "ok";
    };
  };
}
