import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'FUGA Products API', version: '1.0.0', description: 'Minimal products API' }
  },
  apis: ['src/*.ts']
});
