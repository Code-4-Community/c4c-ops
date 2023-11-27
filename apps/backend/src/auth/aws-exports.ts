const CognitoAuthConfig = {
  userPoolId: process.env.NX_COGNITO_USER_POOL_ID,
  clientId: process.env.NX_COGNITO_CLIENT_ID,
  region: 'us-east-2',
};

export default CognitoAuthConfig;
