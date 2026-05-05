const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HireTrack API',
      version: '1.0.0',
      description: 'AI‑powered job application tracker',
    },
    servers: [{ url: 'http://localhost:5000/api', description: 'Development' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js'], // Path to your route files
};

module.exports = swaggerJsdoc(options);