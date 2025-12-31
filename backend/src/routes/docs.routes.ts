/**
 * API Documentation Routes
 * مسارات توثيق API
 */

import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

const router = Router();

// Load OpenAPI spec
let openApiSpec: object | null = null;

const loadOpenApiSpec = () => {
  if (!openApiSpec) {
    try {
      const specPath = path.join(__dirname, '../docs/openapi.yaml');
      const fileContents = fs.readFileSync(specPath, 'utf8');
      openApiSpec = yaml.load(fileContents) as object;
    } catch (error) {
      console.error('Failed to load OpenAPI spec:', error);
    }
  }
  return openApiSpec;
};

/**
 * @route GET /api/v1/docs
 * @desc Swagger UI HTML page
 */
router.get('/', (_req: Request, res: Response) => {
  const html = `
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xchange API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css">
  <style>
    body {
      margin: 0;
      padding: 0;
    }
    .swagger-ui .topbar {
      display: none;
    }
    .swagger-ui .info {
      margin: 20px 0;
    }
    .swagger-ui .info .title {
      font-size: 2em;
      color: #10b981;
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      padding: 20px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 1.5em;
    }
    .header p {
      margin: 5px 0 0;
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔄 Xchange Egypt API</h1>
    <p>توثيق واجهة برمجة التطبيقات</p>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: '/api/v1/docs/spec',
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: 'BaseLayout',
        deepLinking: true,
        tryItOutEnabled: true,
      });
    }
  </script>
</body>
</html>
  `;
  res.type('html').send(html);
});

/**
 * @route GET /api/v1/docs/spec
 * @desc OpenAPI specification in JSON format
 */
router.get('/spec', (_req: Request, res: Response) => {
  const spec = loadOpenApiSpec();
  if (spec) {
    res.json(spec);
  } else {
    res.status(500).json({
      success: false,
      error: 'Failed to load API specification',
    });
  }
});

/**
 * @route GET /api/v1/docs/spec.yaml
 * @desc OpenAPI specification in YAML format
 */
router.get('/spec.yaml', (_req: Request, res: Response) => {
  try {
    const specPath = path.join(__dirname, '../docs/openapi.yaml');
    const fileContents = fs.readFileSync(specPath, 'utf8');
    res.type('text/yaml').send(fileContents);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to load API specification',
    });
  }
});

/**
 * @route GET /api/v1/docs/postman
 * @desc Postman collection export
 */
router.get('/postman', (_req: Request, res: Response) => {
  const spec = loadOpenApiSpec();
  if (!spec) {
    return res.status(500).json({
      success: false,
      error: 'Failed to load API specification',
    });
  }

  // Convert OpenAPI to Postman collection format
  const postmanCollection = {
    info: {
      name: 'Xchange Egypt API',
      description: 'Xchange Egypt API Collection',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: [],
    variable: [
      {
        key: 'baseUrl',
        value: 'http://localhost:3001/api/v1',
      },
      {
        key: 'token',
        value: '',
      },
    ],
  };

  res.json(postmanCollection);
});

export default router;
