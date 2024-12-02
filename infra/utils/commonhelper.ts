import * as fs from 'fs';
import * as path from 'path';

export class CommonHelper {
    private config: any;

    constructor(configFilePath: string) {
        if (!fs.existsSync(configFilePath)) {
            throw new Error(`Config file not found at path: ${configFilePath}`);
        }
        const configFileContent = fs.readFileSync(configFilePath, 'utf-8');
        this.config = JSON.parse(configFileContent);
    }

    get projectConfig() {
        return this.config.Project;
    }

    get stackConfig() {
        return this.config.Stack;
    }

    getVpcConfig() {
        return this.stackConfig.VPCInfra;
    }

    getSharedConfig() {
        return this.stackConfig.Shared;
    }

    getEcsServicesConfig() {
        return this.stackConfig.ECSServices;
    }

    getServiceByName(serviceName: string) {
        const services = this.stackConfig.ECSServices.Services;
        return services.find((service: any) => service.Name === serviceName);
    }
}
