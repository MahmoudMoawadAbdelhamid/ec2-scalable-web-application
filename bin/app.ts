#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { Ec2ScalableWebAppStack } from '../lib/ec2-scalable-web-app-stack';

const app = new cdk.App();
new Ec2ScalableWebAppStack(app, 'Ec2ScalableWebAppStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});
