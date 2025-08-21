// Import AWS CDK libraries and constructs
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Vpc, SubnetType } from 'aws-cdk-lib/aws-ec2';

// Define a construct to create the VPC
export class VpcConstruct extends Construct {
  // Expose the created VPC for use in other constructs
  public readonly vpc: Vpc;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Create a VPC with 2 availability zones and 2 public subnets
    this.vpc = new Vpc(this, 'WebAppVPC', {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          name: 'public-subnet-1',
          subnetType: SubnetType.PUBLIC,
        },
        {
          name: 'public-subnet-2',
          subnetType: SubnetType.PUBLIC,
        }
      ],
    });
  }
}

