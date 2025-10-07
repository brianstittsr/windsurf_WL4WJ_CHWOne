# 🚀 CHWOne AWS Cloud Deployment

Complete enterprise-grade deployment solution for the CHWOne Community Health Worker platform using AWS cloud services.

## 📋 Overview

This deployment provides a production-ready, scalable infrastructure for CHWOne using:

- **AWS Amplify**: Hosting & CI/CD
- **Amazon Cognito**: Authentication & User Management
- **Amazon DynamoDB**: NoSQL Database
- **Amazon S3**: File Storage with Organization-based Structure
- **AWS Lambda**: Serverless API Functions
- **Amazon API Gateway**: REST API Management
- **AWS CloudFormation/CDK**: Infrastructure as Code

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AWS Amplify   │────│ Amazon Cognito  │────│  Next.js App    │
│   (Hosting)     │    │ (Auth Service)  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Amazon API      │
                    │ Gateway         │
                    └─────────────────┘
                             │
                    ┌─────────────────┐
                    │   AWS Lambda    │
                    │ (API Functions) │
                    └─────────────────┘
                             │
               ┌─────────────┼─────────────┐
               │             │             │
    ┌─────────────────┐ ┌────────────┐ ┌────────────┐
    │ Amazon DynamoDB │ │ Amazon S3  │ │ AWS        │
    │ (Database)      │ │ (Storage)  │ │ CloudFront │
    └─────────────────┘ └────────────┘ └────────────┘
```

## 📦 What's Included

### ✅ Core Infrastructure
- **Complete CDK Stack** (`aws-deployment/cdk/`)
- **Multi-environment Support** (dev/staging/prod)
- **Automated Deployment Scripts**
- **Infrastructure Monitoring**

### ✅ AWS Services Integration
- **Cognito Authentication** with React hooks
- **S3 File Storage** organized by organization
- **DynamoDB Tables** with proper schemas
- **Lambda Functions** for API operations
- **API Gateway** with CORS and throttling

### ✅ Additional AWS Services (Ready for Integration)
- **Amazon Connect** - Contact Center
- **Amazon Lex** - AI Chatbots
- **Amazon Polly** - Text-to-Speech
- **Amazon Rekognition** - Image Analysis
- **AWS HealthLake** - Health Data Storage
- **Amazon Comprehend** - NLP Processing
- **Amazon WorkDocs** - Document Collaboration
- **AWS IoT Core** - Device Connectivity

### ✅ Security & Compliance
- **IAM Roles & Policies** with least privilege
- **Data Encryption** at rest and in transit
- **CORS Configuration** for web security
- **Environment-based Secrets** management

### ✅ Monitoring & Analytics
- **AWS CloudWatch** for logging and monitoring
- **Performance Metrics** collection
- **Error Tracking** and alerting
- **Usage Analytics** dashboard

## 🚀 Quick Start

### Prerequisites
- AWS CLI configured with appropriate permissions
- Node.js 18+ and npm
- AWS CDK CLI (`npm install -g aws-cdk`)
- GitHub repository (for Amplify deployment)

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd chwone-platform
cp .env.template .env.local
# Edit .env.local with your configuration
```

### 2. Deploy Infrastructure
```bash
# Linux/Mac
./aws-deployment/scripts/deploy.sh

# Windows
aws-deployment\scripts\deploy.bat

# Or deploy step-by-step
./aws-deployment/scripts/deploy.sh --bootstrap-only  # First time only
./aws-deployment/scripts/deploy.sh --deploy-only     # Deploy infrastructure
./aws-deployment/scripts/deploy.sh --build-only      # Build application
```

### 3. Configure Amplify
1. Go to AWS Amplify Console
2. Connect your GitHub repository
3. Set build settings using `aws-deployment/amplify/buildspec.yml`
4. Configure environment variables from `.env.local`
5. Enable auto-deployment

### 4. Initialize Database
```bash
npm run init-db
```

## 🔧 Configuration

### Environment Variables
Copy `.env.template` to `.env.local` and configure:

```bash
# AWS Configuration
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_USER_POOL_ID=your-cognito-pool-id
NEXT_PUBLIC_USER_POOL_CLIENT_ID=your-client-id
NEXT_PUBLIC_IDENTITY_POOL_ID=your-identity-pool-id
NEXT_PUBLIC_API_ENDPOINT=https://your-api.execute-api.us-east-1.amazonaws.com/prod
NEXT_PUBLIC_S3_BUCKET=chwone-files

# AWS Credentials
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

### Custom Domain (Optional)
1. Purchase domain through Route 53
2. Request SSL certificate in Certificate Manager
3. Configure Amplify with custom domain
4. Update DNS records

## 📁 Project Structure

```
aws-deployment/
├── cdk/                    # AWS CDK infrastructure
│   ├── lib/
│   │   └── chwone-stack.ts # Main CDK stack
│   ├── bin/
│   │   └── cdk.ts         # CDK app entry point
│   └── package.json       # CDK dependencies
├── amplify/               # Amplify configuration
│   └── buildspec.yml      # Build specifications
├── cognito/              # Cognito configuration
├── dynamodb/             # Database schemas
├── lambda/               # Lambda function code
└── scripts/              # Deployment scripts
    ├── deploy.sh         # Linux/Mac deployment
    └── deploy.bat        # Windows deployment
```

## 🔒 Security Features

### Authentication & Authorization
- **Cognito User Pools** for user management
- **Multi-factor Authentication** support
- **Social Login** integration (Google, Facebook)
- **Role-based Access Control** (RBAC)

### Data Protection
- **S3 Encryption** (SSE-S3 or SSE-KMS)
- **DynamoDB Encryption** at rest
- **HTTPS Everywhere** with SSL/TLS
- **API Authentication** with JWT tokens

### Network Security
- **VPC Configuration** for Lambda functions
- **Security Groups** with minimal access
- **WAF Integration** for API protection
- **CloudFront Geo-blocking**

## 📊 Monitoring & Observability

### AWS CloudWatch
- **Application Logs** from Lambda functions
- **API Gateway Metrics** (requests, latency, errors)
- **Custom Dashboards** for key metrics
- **Alarms** for critical issues

### Performance Monitoring
- **Real User Monitoring** (RUM)
- **Synthetic Monitoring** for uptime
- **Database Performance** insights
- **CDN Performance** metrics

### Business Analytics
- **User Engagement** tracking
- **Form Completion** rates
- **File Upload** statistics
- **API Usage** patterns

## 🔄 CI/CD Pipeline

### Automatic Deployments
- **GitHub Integration** with Amplify
- **Branch-based Environments** (main=prod, develop=staging)
- **Automated Testing** before deployment
- **Rollback Capabilities** for failed deployments

### Build Process
1. **Code Checkout** from GitHub
2. **Dependency Installation** (npm ci)
3. **Type Checking** (TypeScript)
4. **Build Optimization** (Next.js)
5. **Asset Optimization** (images, CSS, JS)
6. **Security Scanning** (optional)
7. **Deployment** to Amplify hosting

## 💰 Cost Optimization

### Pricing Estimates (per month)
- **Amplify Hosting**: $1-25 (based on usage)
- **Cognito**: $0.0055/user + $0.15/SMS
- **DynamoDB**: $0.25/GB + read/write costs
- **S3**: $0.023/GB + request costs
- **Lambda**: $0.20/1M requests
- **API Gateway**: $3.50/million requests
- **CloudFront**: $0.085/GB transfer

### Cost Saving Strategies
- **Reserved Instances** for predictable workloads
- **S3 Lifecycle Policies** for automatic archiving
- **Lambda Provisioned Concurrency** for performance
- **CloudFront Caching** to reduce origin requests
- **Auto-scaling** based on demand

## 🚨 Troubleshooting

### Common Issues

#### CDK Deployment Fails
```bash
# Check CDK version
cdk --version

# Bootstrap if needed
cdk bootstrap

# Check AWS credentials
aws sts get-caller-identity
```

#### Amplify Build Fails
- Check build logs in Amplify Console
- Verify environment variables
- Ensure dependencies are correctly specified
- Check Node.js version compatibility

#### Authentication Issues
- Verify Cognito configuration
- Check User Pool settings
- Validate JWT tokens
- Review CORS settings

#### Database Connection Issues
- Check DynamoDB permissions
- Verify table names and keys
- Review Lambda execution role
- Check VPC configuration

### Support Resources
- **AWS Documentation**: Comprehensive service docs
- **Amplify Community**: Forums and discussions
- **CDK Documentation**: Infrastructure as code guides
- **CHWOne Support**: Application-specific help

---

**CHWOne AWS Deployment** - Enterprise-ready infrastructure for community health operations. 🚀⚕️

## Deployment Steps

### 1. Bootstrap CDK (First Time Only)

```bash
cd aws-deployment/cdk
npm install
cdk bootstrap
```

### 2. Configure Environment Variables

Create a `.env.local` file with your AWS configuration:

```bash
# AWS Configuration
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
NEXT_PUBLIC_AWS_S3_BUCKET=chwone-files

# Cognito Configuration (will be generated)
NEXT_PUBLIC_USER_POOL_ID=
NEXT_PUBLIC_USER_POOL_CLIENT_ID=
NEXT_PUBLIC_IDENTITY_POOL_ID=

# API Configuration
NEXT_PUBLIC_API_ENDPOINT=
```

### 3. Deploy Infrastructure with CDK

```bash
cd aws-deployment/cdk

# Deploy to development environment
cdk deploy --profile your-aws-profile

# Or deploy to specific environment
cdk deploy ChwOneStack --profile your-aws-profile
```

This will create:
- Cognito User Pool and Client
- DynamoDB tables
- S3 bucket
- Lambda functions
- API Gateway
- Amplify app

### 4. Configure Amplify

After CDK deployment, connect your repository to Amplify:

1. Go to AWS Amplify Console
2. Connect your GitHub repository
3. Set build settings using `aws-deployment/amplify/buildspec.yml`
4. Configure environment variables
5. Enable auto-deployment from main branch

### 5. Database Initialization

Run the database initialization script:

```bash
cd scripts
node init-database.js
```

This creates initial data and sets up indexes.

### 6. Configure Domain (Optional)

To use a custom domain:

1. Request a certificate in AWS Certificate Manager
2. Update Amplify app settings with custom domain
3. Update DNS records to point to Amplify

## Service-Specific Configuration

### Amazon Cognito

- **User Pool**: Handles authentication
- **User Pool Client**: Frontend application access
- **Identity Pool**: Temporary AWS credentials for file uploads

### Amazon DynamoDB Tables

```javascript
// Tables created by CDK:
- chwone-users: User profiles and authentication data
- chwone-forms: Form definitions and metadata
- chwone-form-submissions: Form responses
- chwone-files: File metadata
- chwone-analytics: Dashboard metrics
```

### Amazon S3

- **Bucket**: `chwone-files`
- **Structure**:
  ```
  chwone-files/
  ├── region5/
  │   ├── user-id/
  │   │   └── timestamp_filename.ext
  ├── wl4wj/
  │   └── user-id/
  │       └── timestamp_filename.ext
  └── general/
      └── user-id/
          └── timestamp_filename.ext
  ```

### AWS Lambda Functions

- **Form Processor**: Handles form CRUD operations
- **File Processor**: Manages file uploads and metadata
- **Analytics Processor**: Generates dashboard metrics

## Environment Variables

### Frontend (.env.local)
```bash
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_USER_POOL_ID=your-user-pool-id
NEXT_PUBLIC_USER_POOL_CLIENT_ID=your-client-id
NEXT_PUBLIC_IDENTITY_POOL_ID=your-identity-pool-id
NEXT_PUBLIC_API_ENDPOINT=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
NEXT_PUBLIC_S3_BUCKET=chwone-files
```

### Backend Environment
Set these in Lambda function configurations:
```bash
USERS_TABLE=chwone-users
FORMS_TABLE=chwone-forms
SUBMISSIONS_TABLE=chwone-form-submissions
FILES_TABLE=chwone-files
ANALYTICS_TABLE=chwone-analytics
S3_BUCKET=chwone-files
```

## Security Considerations

1. **IAM Roles**: Use least-privilege IAM roles for Lambda functions
2. **Cognito**: Enable MFA for admin users
3. **S3**: Enable server-side encryption and versioning
4. **API Gateway**: Enable CORS and throttling
5. **CloudFront**: Configure proper cache policies

## Monitoring and Logging

- **AWS CloudWatch**: Monitor Lambda functions and API Gateway
- **AWS X-Ray**: Distributed tracing for performance monitoring
- **Amplify Console**: Build and deployment monitoring
- **Cognito Analytics**: User authentication metrics

## Backup and Recovery

- **DynamoDB**: Point-in-time recovery enabled
- **S3**: Versioning and cross-region replication
- **Amplify**: Automatic deployments from Git

## Scaling

- **Lambda**: Automatically scales based on demand
- **DynamoDB**: Auto-scaling enabled for read/write capacity
- **S3**: Virtually unlimited storage
- **CloudFront**: Global CDN for low-latency access

## Cost Optimization

1. **Lambda**: Optimize function memory and timeout
2. **DynamoDB**: Use on-demand pricing for variable workloads
3. **S3**: Configure lifecycle policies for old files
4. **CloudFront**: Use appropriate cache behaviors

## Troubleshooting

### Common Issues

1. **CDK Bootstrap Error**: Ensure AWS credentials are configured
2. **Amplify Build Failures**: Check build logs and environment variables
3. **Cognito Issues**: Verify user pool configuration and client settings
4. **API Errors**: Check Lambda function logs in CloudWatch

### Logs and Debugging

- **Amplify Console**: Build and deployment logs
- **CloudWatch Logs**: Lambda function and API Gateway logs
- **AWS X-Ray**: Performance and error tracing
- **Browser DevTools**: Frontend debugging

## Next Steps

1. **Testing**: Test all functionality in the deployed environment
2. **Performance**: Monitor and optimize based on usage patterns
3. **Security**: Regular security audits and updates
4. **Backup**: Verify backup and recovery procedures
5. **Monitoring**: Set up alerts and dashboards

## Support

For issues with AWS deployment:
- Check AWS documentation
- Review CloudWatch logs
- Contact AWS Support for account-specific issues

For application-specific issues:
- Check application logs
- Review error messages
- Contact development team
