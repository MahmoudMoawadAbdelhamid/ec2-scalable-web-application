**Scalable Web App with EC2, ALB & Auto Scaling**

**Transform your simple web app into a highly available, scalable architecture using AWS services, complete with monitoring and cost-optimization features.**

**Table of Contents**

- [**Solution Overview**](#solution-overview)
- [**Architecture Diagram](#architecture-diagram)** 
- [**AWS CDK Constructs**](#aws-cdk-constructs)
- [**Customizing the Solution**](#customizing-the-solution)
  - **Prerequisites**
  - **Clone & Build**
  - **Deploy**
- [**Operational Metrics & Monitoring**](#operational-metrics--monitoring)
- [**Contributing**](#contributing)
- [**License**](#license)
-----
**Solution Overview**

**This project deploys a web application using:**

- **EC2 instances across two public subnets for high availability**
- **Multi-AZ RDS instances for high availability**
- **Application Load Balancer (ALB) distributing traffic**
- **Auto Scaling Group (ASG) for scaling based on load**
- **CloudWatch alarms tracking CPU metrics**
- **SNS notifications for alerting on high CPU**

**The stack is built with AWS CDK to ensure infrastructure is codified, repeatable, and production-ready.**

-----


**Architecture Diagram**

![image](https://github.com/user-attachments/assets/aedfc8ef-5398-4274-afe1-6cbdd82f6d96)



1. **Public internet → ALB listens on port 80**
1. **ALB forwards HTTP traffic to EC2 instances across two AZs**
1. **EC2 instances run a simple HTTP server**
1. **ASG adjusts instance count (2–4) based on CPU utilization**
1. **CloudWatch Alarm is set on ASG CPU >70%**
1. **SNS Topic sends email notifications when alarm triggers**
-----
**AWS CDK Constructs**

- **VpcConstruct: Builds a VPC with two public subnets across different AZs.**
- **AlbAsgConstruct: Creates ALB, ASG, EC2 instances (t3.micro), IAM roles, user data scripts, security groups, CloudWatch alarm, and SNS topic.**
- **App Entry (bin/app.ts): Ties constructs together within a single CDK Stack.**
- **CDK Configuration Files: cdk.json, tsconfig.json, package.json, and scripts in deployment/.**
-----
**Customizing the Solution**

**Prerequisites**

- **Node.js 16+, AWS CLI, and AWS CDK v2**
- **AWS credentials configured (aws configure)**
- **A real email address for SNS alerts**







**Clone & Build:**

**git clone https://github.com/AShaaban97-dev/ec2-scalable-web-app.git**

**cd ec2-scalable-web-app**

**npm install**

**npm run build**

**npx cdk bootstrap**

**Deploy:**

**npx cdk deploy --require-approval never**

**Once deployed:**

1. **Confirm the SNS email subscription.**
1. **Visit the ALB endpoint—you’ll see your web app.**
-----
**Operational Metrics & Monitoring**

- **CloudWatch Alarm monitors ASG CPU Utilization >70%**
- **SNS Topic sends email notifications when the alarm is triggered**
- **Add additional alarms (e.g. Disk, Network, HTTP 5xx) or dashboards as needed**
-----
** 
