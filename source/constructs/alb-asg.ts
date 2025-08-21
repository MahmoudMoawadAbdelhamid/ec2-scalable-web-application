// Import required AWS CDK modules and services
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Vpc, InstanceType, InstanceClass, InstanceSize, AmazonLinuxImage, AmazonLinuxGeneration, Peer, Port, SecurityGroup, SubnetType } from 'aws-cdk-lib/aws-ec2';
import { ApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { AutoScalingGroup } from 'aws-cdk-lib/aws-autoscaling';
import { Role, ServicePrincipal, ManagedPolicy } from 'aws-cdk-lib/aws-iam';
import { Alarm, ComparisonOperator, TreatMissingData } from 'aws-cdk-lib/aws-cloudwatch';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { SubscriptionProtocol } from 'aws-cdk-lib/aws-sns-subscriptions';

// Define interface for construct props
interface AlbAsgProps {
  vpc: Vpc;
}

// Construct to define ALB and Auto Scaling resources
export class AlbAsgConstruct extends Construct {
  constructor(scope: Construct, id: string, props: AlbAsgProps) {
    super(scope, id);

    // Create a security group for the ALB
    const albSg = new SecurityGroup(this, 'ALBSecurityGroup', {
      vpc: props.vpc,
      allowAllOutbound: true,
    });
    // Allow HTTP access to ALB from anywhere
    albSg.addIngressRule(Peer.anyIpv4(), Port.tcp(80));

    // Create a security group for EC2 instances
    const ec2Sg = new SecurityGroup(this, 'EC2SecurityGroup', {
      vpc: props.vpc,
      allowAllOutbound: true,
    });
    // Allow traffic to EC2 from ALB only
    ec2Sg.addIngressRule(albSg, Port.tcp(80));

    // Create IAM role for EC2 instances to access SSM
    const role = new Role(this, 'InstanceRole', {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')
      ]
    });

    // Define the Auto Scaling Group for EC2 instances
    const asg = new AutoScalingGroup(this, 'WebAsg', {
      vpc: props.vpc,
      vpcSubnets: { subnetType: SubnetType.PUBLIC },
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
      machineImage: new AmazonLinuxImage({
        generation: AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      desiredCapacity: 2,
      minCapacity: 2,
      maxCapacity: 4,
      securityGroup: ec2Sg,
      role,
    });

    // Add user data to install and start a web server
    asg.addUserData(
      '#!/bin/bash',
      'yum install -y httpd',
      'systemctl enable httpd',
      'systemctl start httpd',
      'echo "<h1>Welcome to Public Subnet Web App</h1>" > /var/www/html/index.html'
    );

    // Create an internet-facing Application Load Balancer
    const alb = new ApplicationLoadBalancer(this, 'AppALB', {
      vpc: props.vpc,
      internetFacing: true,
      securityGroup: albSg,
      vpcSubnets: { subnetType: SubnetType.PUBLIC },
    });

    // Add listener to the ALB for port 80
    const listener = alb.addListener('Listener', {
      port: 80,
      open: true,
    });

    // Register EC2 instances with the ALB target group
    listener.addTargets('EC2Targets', {
      port: 80,
      targets: [asg],
      healthCheck: {
        path: '/',
        healthyHttpCodes: '200',
      },
    });

    // Create SNS topic for CloudWatch alarm notifications
    const topic = new Topic(this, 'CpuAlarmTopic');

    // Subscribe an email endpoint to the SNS topic
    topic.addSubscription({
      bind: () => ({
        protocol: SubscriptionProtocol.EMAIL,
        endpoint: 'your-alerts@example.com',
      })
    });

    // Create a CloudWatch alarm for high CPU usage
    new Alarm(this, 'HighCpuAlarm', {
      metric: asg.metricCpuUtilization(),
      threshold: 70,
      evaluationPeriods: 2,
      datapointsToAlarm: 2,
      comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: TreatMissingData.NOT_BREACHING,
      alarmDescription: 'Alarm if CPU exceeds 70% for 2 periods',
      alarmName: 'ASG-HighCPU',
      actionsEnabled: true,
      alarmActions: [topic.topicArn],
    });
  }
}

