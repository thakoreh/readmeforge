import * as yaml from "yaml";

interface ParameterSchema {
  type?: string;
  enum?: string[];
  default?: string | number | boolean;
  items?: ParameterSchema;
  properties?: Record<string, ParameterSchema>;
  required?: string[];
}

interface Parameter {
  name: string;
  in: string;
  description: string;
  required: boolean;
  schema: ParameterSchema;
}

interface RequestBody {
  content?: Record<string, { schema?: ParameterSchema }>;
  required?: boolean;
}

interface Response {
  description: string;
  content?: Record<string, { schema?: ParameterSchema }>;
}

interface SecurityScheme {
  type: string;
  description?: string;
  scheme?: string;
  bearerFormat?: string;
  name?: string;
  in?: string;
}

export interface OpenAPIPath {
  path: string;
  methods: {
    method: string;
    summary: string;
    description: string;
    parameters: Parameter[];
    requestBody?: RequestBody;
    responses: Record<string, Response>;
    security?: Record<string, string[]>[];
  }[];
}

export interface OpenAPIData {
  title: string;
  description: string;
  version: string;
  baseUrl: string;
  paths: OpenAPIPath[];
  security: { name: string; type: string; description: string }[];
  contact?: { name?: string; email?: string; url?: string };
  license?: { name: string; url?: string };
  rateLimits?: { tier: string; requests: number; window: string }[];
}

function parseParameters(params: Array<{
  name: string;
  in: string;
  description?: string;
  required?: boolean;
  schema?: ParameterSchema;
}>): Parameter[] {
  return params.map((p) => ({
    name: p.name,
    in: p.in,
    description: p.description || "",
    required: p.required || false,
    schema: p.schema || {},
  }));
}

export function parseOpenAPI(input: string): OpenAPIData {
  let spec: {
    openapi?: string;
    info?: {
      title?: string;
      description?: string;
      version?: string;
      contact?: { name?: string; email?: string; url?: string };
      license?: { name?: string; url?: string };
    };
    servers?: Array<{ url: string; description?: string; variables?: Record<string, { default?: string }> }>;
    paths?: Record<string, {
      get?: Record<string, unknown>;
      post?: Record<string, unknown>;
      put?: Record<string, unknown>;
      patch?: Record<string, unknown>;
      delete?: Record<string, unknown>;
      options?: Record<string, unknown>;
      head?: Record<string, unknown>;
    }>;
    components?: { securitySchemes?: Record<string, SecurityScheme> };
  };

  // Try parsing as YAML first, then JSON
  try {
    spec = yaml.parse(input);
  } catch {
    try {
      spec = JSON.parse(input);
    } catch {
      throw new Error("Invalid YAML or JSON format");
    }
  }

  if (!spec || !spec.openapi) {
    throw new Error("Not a valid OpenAPI specification (missing 'openapi' field)");
  }

  const openapiVersion = spec.openapi;
  if (!openapiVersion.startsWith("3.")) {
    throw new Error("Only OpenAPI 3.x specifications are supported");
  }

  const data: OpenAPIData = {
    title: spec.info?.title || "API Documentation",
    description: spec.info?.description || "",
    version: spec.info?.version || "1.0.0",
    baseUrl: spec.servers?.[0]?.url || "",
    paths: [],
    security: [],
    contact: spec.info?.contact,
    license: spec.info?.license?.name ? { name: spec.info.license.name, url: spec.info.license.url } : undefined,
  };

  // Extract rate limits from server variables or extensions
  if (spec.servers?.[0]?.variables?.rateLimit) {
    data.rateLimits = [{
      tier: "default",
      requests: parseInt(spec.servers[0].variables.rateLimit.default || "1000"),
      window: "per minute"
    }];
  }

  // Parse paths
  if (spec.paths) {
    type PathMethods = "get" | "post" | "put" | "patch" | "delete" | "options" | "head";
    const httpMethods: PathMethods[] = ["get", "post", "put", "patch", "delete", "options", "head"];
    
    for (const [path, pathItem] of Object.entries(spec.paths)) {
      const methods: OpenAPIPath["methods"] = [];

      for (const method of httpMethods) {
        const operation = (pathItem as Record<string, unknown>)[method];
        if (operation) {
          const op = operation as {
            summary?: string;
            description?: string;
            parameters?: Array<{
              name: string;
              in: string;
              description?: string;
              required?: boolean;
              schema?: ParameterSchema;
            }>;
            requestBody?: RequestBody;
            responses?: Record<string, Response>;
            security?: Record<string, string[]>[];
          };

          methods.push({
            method: method.toUpperCase(),
            summary: op.summary || "",
            description: op.description || "",
            parameters: op.parameters ? parseParameters(op.parameters) : [],
            requestBody: op.requestBody,
            responses: op.responses || {},
            security: op.security,
          });
        }
      }

      if (methods.length > 0) {
        data.paths.push({ path, methods });
      }
    }
  }

  // Parse security schemes
  if (spec.components?.securitySchemes) {
    for (const [name, scheme] of Object.entries(spec.components.securitySchemes)) {
      data.security.push({
        name,
        type: scheme.type,
        description: scheme.description || `${scheme.type} authentication`,
      });
    }
  }

  return data;
}

export function validateOpenAPI(input: string): { valid: boolean; error?: string } {
  try {
    parseOpenAPI(input);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: (e as Error).message };
  }
}
