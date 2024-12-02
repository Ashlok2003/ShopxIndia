import { ApolloGateway, GraphQLDataSourceProcessOptions, RemoteGraphQLDataSource, ServiceEndpointDefinition } from "@apollo/gateway";
import { ApolloServer } from '@apollo/server';
import { handlers, startServerAndCreateLambdaHandler } from "@as-integrations/aws-lambda";
import { DiscoverInstancesCommand, ListServicesCommand, ServiceDiscoveryClient } from "@aws-sdk/client-servicediscovery";
import * as AWSXray from "aws-xray-sdk-core";
import * as cdk from 'aws-cdk-lib';

AWSXray.captureHTTPsGlobal(require("https"), true);
AWSXray.captureHTTPsGlobal(require("http"), true);

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
    willSendRequest({ request }: GraphQLDataSourceProcessOptions<Record<string, any>>): void | Promise<void> {
        request.http?.headers.set('x-api-key', process.env.API_KEY!);
    }
}

async function getServicesFromNamespace(namespaceName: string): Promise<ServiceEndpointDefinition[]> {
    const client = new ServiceDiscoveryClient({ region:  "ap-south-1" });

    const listServiceCommand = new ListServicesCommand({});
    const servicesResponse = await client.send(listServiceCommand);

    const serviceInNamespace = servicesResponse.Services?.filter(service => service.Name?.includes(namespaceName)) ?? [];

    const operations = serviceInNamespace!.map(async (service) => {
        const discoverInstancesCommand = new DiscoverInstancesCommand({
            NamespaceName: namespaceName,
            ServiceName: service.Name,
        });

        const instancesResponse = await client.send(discoverInstancesCommand);

        return instancesResponse.Instances?.map(instance => ({
            name: service.Name!,
            url: `http://${instance.Attributes?.['AWS_INSTANCE_IPV4']}:${instance.Attributes?.['AWS_INSTANCE_PORT']}/graphql`
        })) ?? [];
    });

    const serviceEndpoints = await Promise.all(operations ?? []);
    return serviceEndpoints.flat();
}

exports.handler = async (event: any) => {
    const namespaceName = process.env.NAMESPACE_NAME!;
    const services = await getServicesFromNamespace(namespaceName);

    const gateway = new ApolloGateway({
        serviceList: services,
        buildService({ name, url }) {
            return new AuthenticatedDataSource({ url });
        }
    });

    const server = new ApolloServer({ gateway });

    return startServerAndCreateLambdaHandler(server,
        handlers.createAPIGatewayProxyEventV2RequestHandler());
}