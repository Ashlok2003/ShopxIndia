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
import { useServer } from "graphql-ws/lib/use/ws";
import http from "http";
import path from 'path';
import { WebSocketServer } from 'ws';
import { validateToken } from "./config/auth";
import permission from "./graphql/permission";
import resolvers from './graphql/resolvers';
import { formatError } from "./middlewares/errorHandler";
import "./services/intermessage.service";

const typeDefs = gql`${fs.readFileSync(path.join(__dirname, 'graphql', 'schema.graphql'), 'utf8')}`;

const PORT = process.env.PORT ?? 4002;


console.log("RABBITMQ: ", process.env.RABBITMQ_URL);
console.log("REDIS: ", process.env.REDIS_URL);


const app: Express = express();
const httpServer = http.createServer(app);

const schema = buildSubgraphSchema({
    typeDefs,
    resolvers,
});


interface Context {
    user?: any
}

const schemaWithMiddleware = applyMiddleware(schema, permission);

const server = new ApolloServer<Context>({
    schema: schemaWithMiddleware,
    csrfPrevention: true,
    formatError,
    introspection: true,
    plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
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

    const wsServer = new WebSocketServer({
        server: httpServer,
        path: "/graphql"
    });

    useServer({
        schema: schemaWithMiddleware,

        context: async (ctx) => {
            console.log("CTX: ", ctx);

            const authHeader = ctx.connectionParams?.authorization || "";
            let user = null;

            return { user };
        },

        onConnect: (ctx) => {
            console.log('WebSocket connection established');
        },

        onDisconnect: (ctx) => {
            console.log('WebSocket connection disconnected');
        },
    }, wsServer);

    httpServer.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
        console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}/graphql`);
    });

})();
