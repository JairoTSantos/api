# API

## Clonar o Repositório Git

Para começar, clone este repositório Git executando o seguinte comando:

```
git clone https://github.com/JairoTSantos/api
```

## Instalar as Dependências

Após clonar o repositório, navegue até a pasta do projeto e instale as dependências utilizando o npm:

```
cd api
npm install
```

## Configurar as Variáveis de Ambiente

Antes de executar a aplicação, é necessário configurar as variáveis de ambiente. Crie um arquivo `.env` na raiz do projeto e adicione as seguintes variáveis:

```
PORT=3000

ID_DEPUTADO=000000 (Pegar esse ID em https://dadosabertos.camara.leg.br/)
NOME_DEPUTADO=Nome do deputado

PRIMEIRA_LEGISLATURA=yyyy-mm-dd (Data da primeira eleição para deputado federal)

MASTER_USER=Administrador (root)
MASTER_EMAIL=admin@admin.com
MASTER_PASS=senha

MASTER_KEY=ChaveSecreta para criptografia das senhas
TOKEN_TIME=1h (tempo que cada token irá durar)

DB_HOST=host
DB_USER=user
DB_PASS=pass
DB_NAME=name
```
## Sincronizar as tabelas do banco
Inicie a aplicação com

```
npm start
```
e depois acesse `/api/sync` para criar as tabelas do banco

## Acessar a Documentação

Depois de configurar as variáveis de ambiente, você pode acessar a documentação da API navegando para:

```
/api-docs
```

Isso abrirá a documentação onde você pode explorar os endpoints disponíveis e fazer solicitações à API.
