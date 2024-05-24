declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: 'development' | 'production' | 'test';
        PORT?: string;
        MASTER_USER: string;
        MASTER_EMAIL: string;
        MASTER_PASS: string;
        MASTER_KEY: string;
        TOKEN_TIME: string;
        MASTER_PHONE: string;
        MASTER_BIRTHDAY: string;
        ID_DEPUTADO: string;
        NOME_DEPUTADO: string;
    }
}
