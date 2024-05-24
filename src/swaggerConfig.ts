import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    swaggerDefinition: {
        info: {
            title: 'Gabinete Digital',
            version: '1.0.0',
            description: 'Backend aplicação Gabinete Digital',
        },
        servers: [{ url: 'http://localhost:3000/api' }],
    },
    apis: ['src/rotas/*.ts'],
};

const specs = swaggerJsdoc(options);

export default specs;