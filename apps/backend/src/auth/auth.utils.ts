import { AttributeType } from '@aws-sdk/client-cognito-identity-provider';

// new updated attribute type includes username
export type UpdatedAttributeType = {
  username: string;
  attributes: AttributeType[];
};
