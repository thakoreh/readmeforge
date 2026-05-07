import { OpenAPIData } from "./parser";

export type TemplateId = "minimal-dark" | "stripe-style" | "gradient-modern" | "devto-style" | "enterprise-blue";

export const TEMPLATES = [
  { id: "minimal-dark" as TemplateId, name: "Minimal Dark", description: "Clean, dark-themed, developer-focused" },
  { id: "stripe-style" as TemplateId, name: "Stripe-style", description: "Elegant documentation like Stripe API" },
  { id: "gradient-modern" as TemplateId, name: "Gradient Modern", description: "Vibrant gradients with modern typography" },
  { id: "devto-style" as TemplateId, name: "DevTo-style", description: "Clean community-style documentation" },
  { id: "enterprise-blue" as TemplateId, name: "Enterprise Blue", description: "Professional enterprise documentation" },
];

function generateMethodBadge(method: string) {
  return `\`${method}\``;
}

export function generateReadme(data: OpenAPIData, templateId: TemplateId): string {
  switch (templateId) {
    case "minimal-dark":
      return generateMinimalDark(data);
    case "stripe-style":
      return generateStripeStyle(data);
    case "gradient-modern":
      return generateGradientModern(data);
    case "devto-style":
      return generateDevToStyle(data);
    case "enterprise-blue":
      return generateEnterpriseBlue(data);
    default:
      return generateMinimalDark(data);
  }
}

function generateMinimalDark(data: OpenAPIData): string {
  const hasAuth = data.security.length > 0;
  
  let out = `# ${data.title}\n\n`;
  
  if (data.description) {
    out += `${data.description}\n\n`;
  }
  
  out += `**Version:** ${data.version}\n`;
  if (data.baseUrl) {
    out += `**Base URL:** \`${data.baseUrl}\`\n`;
  }
  out += "\n---\n\n";

  if (hasAuth) {
    out += `## Authentication\n\n`;
    for (const sec of data.security) {
      out += `- **${sec.name}** (${sec.type}): ${sec.description}\n`;
    }
    out += "\n---\n\n";
  }

  out += `## Endpoints\n\n`;
  
  for (const path of data.paths) {
    out += `### \`${path.path}\`\n\n`;
    
    for (const method of path.methods) {
      out += `- ${generateMethodBadge(method.method)} ${method.summary || "No summary"}\n`;
      if (method.description) {
        out += `  ${method.description}\n`;
      }
      
      if (method.parameters.length > 0) {
        out += `\n  **Parameters:**\n`;
        for (const param of method.parameters) {
          const required = param.required ? "required" : "optional";
          out += `  - \`${param.name}\` (${param.in}, ${required}): ${param.description}\n`;
        }
      }
      
      if (method.requestBody) {
        out += `\n  **Request Body:** ${method.requestBody.required ? "(required)" : "(optional)"}\n`;
        const contentTypes = Object.keys(method.requestBody.content || {});
        if (contentTypes.length > 0) {
          out += `  Content types: ${contentTypes.join(", ")}\n`;
        }
      }
      
      out += "\n";
    }
  }

  if (data.contact) {
    out += `---\n\n## Contact\n\n`;
    if (data.contact.name) out += `- **Name:** ${data.contact.name}\n`;
    if (data.contact.email) out += `- **Email:** ${data.contact.email}\n`;
    if (data.contact.url) out += `- **URL:** ${data.contact.url}\n`;
  }

  return out;
}

function generateStripeStyle(data: OpenAPIData): string {
  let out = `# ${data.title}\n\n`;
  out += `> ${data.description || "API Reference"}\n\n`;
  out += `**Current version:** ${data.version}\n\n`;
  
  if (data.baseUrl) {
    out += `**Base URL:** \`${data.baseUrl}\`\n`;
  }

  out += `---\n\n`;
  out += `## Table of Contents\n\n`;
  if (data.security.length > 0) {
    out += `- [Authentication](#authentication)\n`;
  }
  
  for (const path of data.paths) {
    const pathName = path.path.replace(/[^a-zA-Z0-9]/g, "-").replace(/^-|-$/g, "");
    out += `- [${path.path}](#${pathName})\n`;
  }
  
  out += "\n---\n\n";

  if (data.security.length > 0) {
    out += `## Authentication\n\n`;
    out += `${data.security[0].description}\n\n`;
    
    out += `\`\`\`\n`;
    if (data.security[0].type === "http") {
      out += `Authorization: Bearer <your_api_key>\n`;
    } else if (data.security[0].type === "apiKey") {
      out += `${data.security[0].name}: <your_api_key>\n`;
    }
    out += `\`\`\`\n\n`;
    
    out += `---\n\n`;
  }

  for (const path of data.paths) {
    out += `## ${path.path}\n\n`;
    
    for (const method of path.methods) {
      out += `### ${method.method} ${path.path}\n\n`;
      out += `**${method.summary || "No description"}**\n\n`;
      
      if (method.description) {
        out += `${method.description}\n\n`;
      }
      
      if (method.parameters.length > 0) {
        out += `**Parameters**\n\n`;
        out += `| Name | Location | Type | Required | Description |\n`;
        out += `|------|----------|------|----------|-------------|\n`;
        for (const param of method.parameters) {
          out += `| \`${param.name}\` | ${param.in} | \`${param.schema?.type || "string"}\` | ${param.required ? "Yes" : "No"} | ${param.description} |\n`;
        }
        out += "\n";
      }
      
      if (Object.keys(method.responses).length > 0) {
        out += `**Responses**\n\n`;
        for (const [code, response] of Object.entries(method.responses)) {
          out += `- \`${code}\`: ${response.description}\n`;
        }
        out += "\n";
      }
    }
  }

  return out;
}

function generateGradientModern(data: OpenAPIData): string {
  let out = `# ✨ ${data.title}\n\n`;
  out += `<p align="center">\n`;
  out += `  <img src="https://img.shields.io/badge/Version-${data.version}-6F42C1?style=for-the-badge" alt="Version">\n`;
  out += `  <img src="https://img.shields.io/badge/OpenAPI-3.0-6F42C1?style=for-the-badge" alt="OpenAPI">\n`;
  out += `</p>\n\n`;
  
  out += `---\n\n`;
  out += `## 🎯 Features\n\n`;
  out += `- 📚 ${data.paths.length} API endpoints\n`;
  out += `- 🔐 ${data.security.length} authentication methods\n`;
  if (data.baseUrl) out += `- 🌐 Base URL: \`${data.baseUrl}\`\n`;
  out += "\n";

  if (data.description) {
    out += `## 📖 About\n\n${data.description}\n\n`;
  }

  out += `---\n\n`;
  out += `## 🚀 Quick Start\n\n`;
  out += "```bash\n";
  out += `# Install dependencies\n`;
  out += `npm install\n\n`;
  out += `# Make your first request\n`;
  out += `curl -X GET ${data.baseUrl || "<base_url>"}/endpoint\n`;
  out += "```\n\n";

  if (data.security.length > 0) {
    out += `## 🔑 Authentication\n\n`;
    for (const sec of data.security) {
      out += `| Method | Type | Description |\n`;
      out += `|--------|------|-------------|\n`;
      out += `| ${sec.name} | ${sec.type} | ${sec.description} |\n\n`;
    }
  }

  out += `## 📡 Endpoints\n\n`;
  
  for (const path of data.paths) {
    out += `### \`${path.path}\`\n\n`;
    
    for (const method of path.methods) {
      const emoji = {
        GET: "📥", POST: "📤", PUT: "🔄", PATCH: "🔧", DELETE: "🗑️"
      }[method.method] || "📋";
      
      out += `${emoji} **${method.method}** ${method.summary || ""}\n\n`;
      
      if (method.description) {
        out += `${method.description}\n\n`;
      }
      
      if (method.parameters.length > 0) {
        out += `| Parameter | Type | Required | Description |\n`;
        out += `|-----------|------|----------|-------------|\n`;
        for (const param of method.parameters) {
          out += `| \`${param.name}\` | \`${param.schema?.type || "string"}\` | ${param.required ? "✅" : "❌"} | ${param.description} |\n`;
        }
        out += "\n";
      }
    }
  }

  if (data.contact) {
    out += `---\n\n## 📞 Support\n\n`;
    if (data.contact.name) out += `- **Contact:** ${data.contact.name}\n`;
    if (data.contact.email) out += `- **Email:** ${data.contact.email}\n`;
    if (data.contact.url) out += `- **URL:** ${data.contact.url}\n`;
  }

  return out;
}

function generateDevToStyle(data: OpenAPIData): string {
  let out = `---\n`;
  out += `title: ${data.title}\n`;
  out += `description: ${data.description || "API documentation"}\n`;
  out += `tags: [api, documentation, openapi]\n`;
  out += `---\n\n`;
  
  out += `# ${data.title}\n\n`;
  out += `*${data.description || "API Documentation"}*\n\n`;
  out += `---\n\n`;

  out += `## Overview\n\n`;
  out += `- **Version:** ${data.version}\n`;
  if (data.baseUrl) out += `- **Base URL:** \`${data.baseUrl}\`\n`;
  out += `- **Endpoints:** ${data.paths.length}\n`;
  out += `- **Authentication:** ${data.security.length > 0 ? data.security.map(s => s.type).join(", ") : "None"}\n`;
  out += "\n";

  if (data.security.length > 0) {
    out += `## Authentication\n\n`;
    out += `This API uses the following authentication methods:\n\n`;
    for (const sec of data.security) {
      out += `- **${sec.name}** — ${sec.description}\n`;
    }
    out += "\n";
  }

  out += `## Endpoints\n\n`;
  
  for (const path of data.paths) {
    out += `### \`${path.path}\`\n\n`;
    
    for (const method of path.methods) {
      out += `#### `;
      out += `\`\`${method.method}\`\` `;
      out += `${method.summary || ""}\n\n`;
      
      if (method.description) {
        out += `${method.description}\n\n`;
      }
      
      if (method.parameters.length > 0) {
        out += `**Parameters**\n\n`;
        for (const param of method.parameters) {
          out += `- \`${param.name}\` `;
          out += `*${param.in}* `;
          out += `(${param.required ? "required" : "optional"}) `;
          out += `— ${param.description}\n`;
        }
        out += "\n";
      }
      
      if (Object.keys(method.responses).length > 0) {
        out += `**Responses**\n\n`;
        for (const [code, response] of Object.entries(method.responses)) {
          out += `- \`${code}\`: ${response.description}\n`;
        }
        out += "\n";
      }
    }
  }

  if (data.license) {
    out += `## License\n\n`;
    out += `${data.license.name}`;
    if (data.license.url) out += ` — ${data.license.url}`;
    out += "\n";
  }

  return out;
}

function generateEnterpriseBlue(data: OpenAPIData): string {
  let out = `# ${data.title}\n`;
  out += `---\n\n`;
  out += `<!-- DOCUMENT METADATA -->\n`;
  out += `<!-- Version: ${data.version} -->\n`;
  out += `<!-- Last Updated: ${new Date().toISOString().split("T")[0]} -->\n\n`;
  
  out += `---\n\n`;
  out += `## Executive Summary\n\n`;
  out += `This document provides the technical specification for the ${data.title} API.\n`;
  out += `${data.description || ""}\n\n`;
  
  out += `| Attribute | Value |\n`;
  out += `|-----------|-------|\n`;
  out += `| Version | ${data.version} |\n`;
  out += `| Base URL | \`${data.baseUrl || "N/A"}\` |\n`;
  out += `| Total Endpoints | ${data.paths.length} |\n`;
  out += `| Authentication | ${data.security.length > 0 ? data.security.map(s => s.name).join(", ") : "None"} |\n`;
  if (data.license) out += `| License | ${data.license.name} |\n`;
  out += `\n`;

  if (data.security.length > 0) {
    out += `## 1. Authentication & Authorization\n\n`;
    
    for (const sec of data.security) {
      out += `### 1.1 ${sec.name}\n\n`;
      out += `**Type:** ${sec.type}\n\n`;
      out += `**Description:** ${sec.description}\n\n`;
      
      if (sec.type === "http" && sec.name.toLowerCase().includes("bearer")) {
        out += `**Usage:**\n\`\`\`http\nAuthorization: Bearer <token>\n\`\`\`\n\n`;
      } else if (sec.type === "apiKey") {
        out += `**Usage:**\n\`\`\`http\nX-API-Key: <your_api_key>\n\`\`\`\n\n`;
      }
    }
  }

  out += `## 2. API Endpoints\n\n`;
  
  let endpointNum = 1;
  for (const path of data.paths) {
    out += `### 2.${endpointNum} ${path.path}\n\n`;
    
    for (const method of path.methods) {
      out += `#### ${generateMethodBadge(method.method)} ${method.summary || "No summary"}\n\n`;
      
      if (method.description) {
        out += `**Description:** ${method.description}\n\n`;
      }
      
      if (method.parameters.length > 0) {
        out += `**Request Parameters**\n\n`;
        out += `| Name | Location | Type | Required | Description |\n`;
        out += `|------|----------|------|----------|-------------|\n`;
        for (const param of method.parameters) {
          out += `| \`${param.name}\` | ${param.in} | \`${param.schema?.type || "string"}\` | ${param.required ? "Yes" : "No"} | ${param.description} |\n`;
        }
        out += "\n";
      }
      
      if (method.requestBody) {
        out += `**Request Body**\n\n`;
        const contentTypes = Object.keys(method.requestBody.content || {});
        if (contentTypes.length > 0) {
          out += `Content types: ${contentTypes.join(", ")}\n\n`;
        }
      }
      
      if (Object.keys(method.responses).length > 0) {
        out += `**Responses**\n\n`;
        out += `| Status | Description |\n`;
        out += `|--------|-------------|\n`;
        for (const [code, response] of Object.entries(method.responses)) {
          out += `| ${code} | ${response.description} |\n`;
        }
        out += "\n";
      }
    }
    endpointNum++;
  }

  if (data.contact) {
    out += `## 3. Support & Contact\n\n`;
    out += `| Channel | Information |\n`;
    out += `|---------|-------------|\n`;
    if (data.contact.name) out += `| Name | ${data.contact.name} |\n`;
    if (data.contact.email) out += `| Email | ${data.contact.email} |\n`;
    if (data.contact.url) out += `| URL | ${data.contact.url} |\n`;
    out += "\n";
  }

  if (data.license) {
    out += `## 4. Legal\n\n`;
    out += `**License:** ${data.license.name}`;
    if (data.license.url) out += ` (${data.license.url})`;
    out += "\n";
  }

  return out;
}
