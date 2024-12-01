#!/usr/bin/env node

import { VPCInfraStack } from './common/vpc-infra-stack';
import { EcsAlbServiceStack } from "./ecs/ecs-alb-service-stack";
import { SharedResourcesStack } from "./shared/shared-resources";
