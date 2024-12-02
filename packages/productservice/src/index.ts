import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { buildSubgraphSchema } from "@apollo/subgraph";
import cors from 'cors';
import "dotenv/config";
import express, { type Express } from 'express';
import fs from 'fs';
import { applyMiddleware } from "graphql-middleware";
import gql from 'graphql-tag';
import path from 'path';
import { validateToken } from "./config/auth";
import permission from "./graphql/permission";
import resolvers from './graphql/resolvers';
import { formatError } from "./middlewares/errorHandler";
import "./services/intermessage.service";
import { graphqlUploadExpress } from "graphql-upload-ts";


const typeDefs = gql`${fs.readFileSync(path.join(__dirname, 'graphql', 'schema.graphql'), 'utf8')}`;

const PORT = process.env.PORT ?? 4003;


const app: Express = express();

const schema = buildSubgraphSchema({
    typeDefs,
    resolvers,
});

interface Context {
    user?: any
}

app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

const schemaWithMiddleware = applyMiddleware(schema, permission);

const server = new ApolloServer<Context>({
    schema: schemaWithMiddleware,
    csrfPrevention: true,
    formatError,
    introspection: true,
    plugins: [
        ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
});

(async () => {
    await server.start();

    app.use('/', cors<cors.CorsRequest>(), express.json(),
        expressMiddleware(server, {
            context: async ({ req }) => {
                const authHeader = req.headers.authorization || "";
                let user = null;

                if (authHeader && authHeader.startsWith("Bearer ")) {
                    const token = authHeader.replace("Bearer ", "");
                    user = await validateToken(token);
                }

                return { user, headers: authHeader };
            },
        }));

    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
})()

