import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FUGA Products API',
      version: '1.0.0',
      description:
        'Minimal product management API (FUGA-style). Upload cover art, list products, and manage releases.',
      contact: { name: 'Your Name' }
    },
    servers: [
      { url: process.env.PUBLIC_BASE_URL || 'http://localhost:3000', description: 'Local' }
    ],
    tags: [
      { name: 'Products', description: 'Create and manage music products (releases)' }
    ],
    components: {
      schemas: {
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 123 },
            name: { type: 'string', example: 'Arcane: Piltover Nights (OST)' },
            artistName: { type: 'string', example: 'Riot Games Music' },
            coverUrl: { type: 'string', format: 'uri', example: 'http://localhost:3000/uploads/abc.png' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          },
          required: ['id', 'name', 'artistName', 'coverUrl', 'createdAt', 'updatedAt']
        },
        NewProductRequest: {
          type: 'object',
          required: ['name', 'artistName', 'cover'],
          properties: {
            name: { type: 'string' },
            artistName: { type: 'string' },
            cover: { type: 'string', format: 'binary', description: 'Image file (PNG/JPG, ≤10MB)' }
          }
        },
        UpdateProductRequest: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            artistName: { type: 'string' },
            cover: { type: 'string', format: 'binary' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Product not found' }
          },
          required: ['message']
        }
      },
      parameters: {
        ProductIdParam: {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'integer' },
          description: 'Product ID'
        }
      },
      responses: {
        NotFound: { description: 'Not Found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        BadRequest: { description: 'Bad Request', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      }
    }
  },
  // make sure we scan all route files
  apis: ['src/**/*.ts']
});
