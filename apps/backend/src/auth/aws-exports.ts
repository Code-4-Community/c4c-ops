const CognitoAuthConfig = {
  userPoolId: process.env.NX_COGNITO_USER_POOL_ID,
  clientId: process.env.NX_COGNITO_CLIENT_ID,
  clientName: process.env.NX_COGNITO_CLIENT_NAME,
  region: 'us-east-2',
};

export default CognitoAuthConfig;
