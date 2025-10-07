# AWS CDK Infrastructure for CHWOne Platform
# This defines the complete AWS infrastructure for the CHWOne platform

import * as cdk from 'aws-cdk-lib';
import * as amplify from '@aws-cdk/aws-amplify-alpha';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as ses from 'aws-cdk-lib/aws-ses';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as connect from 'aws-cdk-lib/aws-connect';
import * as lex from 'aws-cdk-lib/aws-lex';
import * as polly from 'aws-cdk-lib/aws-polly';
import * as comprehend from 'aws-cdk-lib/aws-comprehend';
import * as rekognition from 'aws-cdk-lib/aws-rekognition';
import * as healthlake from 'aws-cdk-lib/aws-healthlake';
import * as iot from 'aws-cdk-lib/aws-iot';
import * as workdocs from 'aws-cdk-lib/aws-workdocs';
import * as iam from 'aws-cdk-lib/aws-iam';

export class ChwOneStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ============================================================================
    // COGNITO USER POOL & IDENTITY POOL
    // ============================================================================

    // User Pool for authentication
    const userPool = new cognito.UserPool(this, 'ChwOneUserPool', {
      userPoolName: 'chwone-user-pool',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
        phone: true,
      },
      autoVerify: {
        email: true,
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      userInvitation: {
        emailSubject: 'Welcome to CHWOne Platform!',
        emailBody: 'Your username is {username} and temporary password is {####}',
      },
    });

    // User Pool Client
    const userPoolClient = new cognito.UserPoolClient(this, 'ChwOneUserPoolClient', {
      userPool,
      authFlows: {
        userPassword: true,
        userSrp: true,
        adminUserPassword: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: true,
        },
        scopes: [
          cognito.OAuthScope.PHONE,
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: [
          'http://localhost:3000/auth/callback',
          'https://chwone.yourdomain.com/auth/callback'
        ],
        logoutUrls: [
          'http://localhost:3000/',
          'https://chwone.yourdomain.com/'
        ],
      },
    });

    // Identity Pool for temporary AWS credentials
    const identityPool = new cognito.CfnIdentityPool(this, 'ChwOneIdentityPool', {
      identityPoolName: 'chwone-identity-pool',
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [{
        clientId: userPoolClient.userPoolClientId,
        providerName: userPool.userPoolProviderName,
      }],
    });

    // ============================================================================
    // DYNAMODB TABLES
    // ============================================================================

    // Users table
    const usersTable = new dynamodb.Table(this, 'UsersTable', {
      tableName: 'chwone-users',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
    });

    // Forms table
    const formsTable = new dynamodb.Table(this, 'FormsTable', {
      tableName: 'chwone-forms',
      partitionKey: { name: 'formId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
    });

    // Submissions table
    const submissionsTable = new dynamodb.Table(this, 'SubmissionsTable', {
      tableName: 'chwone-form-submissions',
      partitionKey: { name: 'submissionId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'formId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
    });

    // Files table
    const filesTable = new dynamodb.Table(this, 'FilesTable', {
      tableName: 'chwone-files',
      partitionKey: { name: 'fileId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // Analytics table
    const analyticsTable = new dynamodb.Table(this, 'AnalyticsTable', {
      tableName: 'chwone-analytics',
      partitionKey: { name: 'organization', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'date', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // ============================================================================
    // S3 BUCKETS
    // ============================================================================

    // File storage bucket
    const fileStorageBucket = new s3.Bucket(this, 'FileStorageBucket', {
      bucketName: 'chwone-files',
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [{
        allowedHeaders: ['*'],
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
        allowedOrigins: ['*'],
        maxAge: 3000,
      }],
      lifecycleRules: [{
        enabled: true,
        transitions: [{
          storageClass: s3.StorageClass.INFREQUENT_ACCESS,
          transitionAfter: cdk.Duration.days(30),
        }],
      }],
    });

    // ============================================================================
    // LAMBDA FUNCTIONS
    // ============================================================================

    // Form processing Lambda
    const formProcessorFunction = new lambda.Function(this, 'FormProcessorFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda/form-processor'),
      handler: 'index.handler',
      environment: {
        USERS_TABLE: usersTable.tableName,
        FORMS_TABLE: formsTable.tableName,
        SUBMISSIONS_TABLE: submissionsTable.tableName,
        FILES_TABLE: filesTable.tableName,
        ANALYTICS_TABLE: analyticsTable.tableName,
      },
      timeout: cdk.Duration.seconds(30),
    });

    // File processing Lambda
    const fileProcessorFunction = new lambda.Function(this, 'FileProcessorFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda/file-processor'),
      handler: 'index.handler',
      environment: {
        BUCKET_NAME: fileStorageBucket.bucketName,
        FILES_TABLE: filesTable.tableName,
      },
      timeout: cdk.Duration.seconds(30),
    });

    // Analytics processor Lambda
    const analyticsProcessorFunction = new lambda.Function(this, 'AnalyticsProcessorFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda/analytics-processor'),
      handler: 'index.handler',
      environment: {
        ANALYTICS_TABLE: analyticsTable.tableName,
      },
      timeout: cdk.Duration.seconds(30),
    });

    // ============================================================================
    // API GATEWAY
    // ============================================================================

    const api = new apigateway.RestApi(this, 'ChwOneApi', {
      restApiName: 'chwone-api',
      description: 'CHWOne Platform API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // API Gateway integrations
    const formsIntegration = new apigateway.LambdaIntegration(formProcessorFunction);
    const filesIntegration = new apigateway.LambdaIntegration(fileProcessorFunction);
    const analyticsIntegration = new apigateway.LambdaIntegration(analyticsProcessorFunction);

    // API Routes
    const forms = api.root.addResource('forms');
    forms.addMethod('GET', formsIntegration);
    forms.addMethod('POST', formsIntegration);

    const form = forms.addResource('{formId}');
    form.addMethod('GET', formsIntegration);
    form.addMethod('PUT', formsIntegration);
    form.addMethod('DELETE', formsIntegration);

    const submissions = form.addResource('submissions');
    submissions.addMethod('GET', formsIntegration);
    submissions.addMethod('POST', formsIntegration);

    const files = api.root.addResource('files');
    files.addMethod('GET', filesIntegration);
    files.addMethod('POST', filesIntegration);

    const analytics = api.root.addResource('analytics');
    analytics.addMethod('GET', analyticsIntegration);

    // ============================================================================
    // AWS AMPLIFY (Hosting)
    // ============================================================================

    const amplifyApp = new amplify.App(this, 'ChwOneAmplifyApp', {
      appName: 'chwone-platform',
      sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
        owner: 'your-github-username',
        repository: 'chwone-platform',
        oauthToken: cdk.SecretValue.secretsManager('github-token'),
      }),
      environmentVariables: {
        NEXT_PUBLIC_AWS_REGION: this.region,
        NEXT_PUBLIC_USER_POOL_ID: userPool.userPoolId,
        NEXT_PUBLIC_USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
        NEXT_PUBLIC_IDENTITY_POOL_ID: identityPool.ref,
        NEXT_PUBLIC_API_ENDPOINT: api.url,
        NEXT_PUBLIC_S3_BUCKET: fileStorageBucket.bucketName,
      },
      buildSpec: cdk.BuildSpec.fromSourceFilename('aws-deployment/amplify/buildspec.yml'),
    });

    const mainBranch = amplifyApp.addBranch('main', {
      autoBuild: true,
      stage: 'PRODUCTION',
    });

    // ============================================================================
    // ADDITIONAL AWS SERVICES (Placeholders)
    // ============================================================================

    // Amazon Connect - Contact Center
    const connectInstance = new connect.CfnInstance(this, 'ChwOneConnectInstance', {
      identityManagementType: 'CONNECT_MANAGED',
      instanceAlias: 'chwone-connect',
      inboundCallsEnabled: true,
      outboundCallsEnabled: true,
    });

    // Amazon Lex - Chatbots
    const chatbotBot = new lex.CfnBot(this, 'ChwOneChatbot', {
      dataPrivacy: { childDirected: false },
      idleSessionTtlInSeconds: 300,
      name: 'ChwOneAssistant',
      roleArn: '', // Would be created separately
      botLocales: [{
        localeId: 'en_US',
        nluConfidenceThreshold: 0.4,
      }],
    });

    // Amazon Polly - Text-to-Speech
    const pollyRole = new iam.Role(this, 'PollyRole', {
      assumedBy: new iam.ServicePrincipal('polly.amazonaws.com'),
    });

    // Amazon Comprehend - Natural Language Processing
    const comprehendRole = new iam.Role(this, 'ComprehendRole', {
      assumedBy: new iam.ServicePrincipal('comprehend.amazonaws.com'),
    });

    // Amazon Rekognition - Image Analysis
    const rekognitionCollection = new rekognition.CfnCollection(this, 'ChwOneRekognitionCollection', {
      collectionId: 'chwone-faces',
    });

    // AWS HealthLake - Health Data Storage
    const healthLakeDatastore = new healthlake.CfnFHIRDatastore(this, 'ChwOneHealthLake', {
      datastoreName: 'chwone-health-data',
      datastoreTypeVersion: 'R4',
    });

    // AWS IoT Core - Device Connectivity
    const iotPolicy = new iot.CfnPolicy(this, 'ChwOneIoTPolicy', {
      policyDocument: {
        Version: '2012-10-17',
        Statement: [{
          Effect: 'Allow',
          Action: ['iot:*'],
          Resource: ['*'],
        }],
      },
    });

    // Amazon WorkDocs - Document Collaboration
    const workDocsInstance = new workdocs.CfnInstance(this, 'ChwOneWorkDocs', {
      instanceAlias: 'chwone-docs',
      type: 'ENTERPRISE',
    });

    // ============================================================================
    // IAM PERMISSIONS
    // ============================================================================

    // Grant Lambda functions access to DynamoDB tables
    usersTable.grantReadWriteData(formProcessorFunction);
    formsTable.grantReadWriteData(formProcessorFunction);
    submissionsTable.grantReadWriteData(formProcessorFunction);
    filesTable.grantReadWriteData(fileProcessorFunction);
    analyticsTable.grantReadWriteData(analyticsProcessorFunction);

    // Grant Lambda functions access to S3
    fileStorageBucket.grantReadWrite(fileProcessorFunction);

    // ============================================================================
    // OUTPUTS
    // ============================================================================

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
    });

    new cdk.CfnOutput(this, 'IdentityPoolId', {
      value: identityPool.ref,
      description: 'Cognito Identity Pool ID',
    });

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'S3BucketName', {
      value: fileStorageBucket.bucketName,
      description: 'S3 Bucket Name',
    });

    new cdk.CfnOutput(this, 'AmplifyAppId', {
      value: amplifyApp.appId,
      description: 'Amplify App ID',
    });
  }
}
