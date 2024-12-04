# Stage 1

FROM node:20-alpine AS builder

WORKDIR /build

COPY package*.json ./

RUN npm install

COPY src/ src/
COPY tsconfig.json tsconfig.json

RUN npm run build

RUN mkdir -p dist/graphql
RUN cp src/graphql/schema.graphql dist/graphql/schema.graphql

# Stage 2

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder build/package*.json .
COPY --from=builder build/node_modules node_modules/
COPY --from=builder /build/dist ./dist/

EXPOSE 4005

CMD [ "npm", "start" ]