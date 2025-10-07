#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { ChwOneStack } = require('../lib/chwone-stack');

const app = new cdk.App();

new ChwOneStack(app, 'ChwOneStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
});

app.synth();
