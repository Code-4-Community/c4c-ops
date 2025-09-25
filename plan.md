# Refresh Token Authentication Implementation Plan

## Current State Analysis

- Backend uses AWS Cognito with amazon-cognito-identity-js library
- Frontend stores only access tokens in sessionStorage
- Existing signin returns both accessToken and refreshToken but refreshToken isn't used
- TODO comment exists in ApplicationTables about implementing auto token refresh
- No refresh token endpoint currently exists

## Implementation Steps

### Step 1: Backend - Create Refresh Token DTO

- Create new DTO: `refresh-token.request.dto.ts` in `/apps/backend/src/auth/dtos/`
- Define validation for refresh token input

### Step 2: Backend - Add Refresh Token Service Method

- Add `refreshToken()` method to `AuthService` class
- Use Cognito's refresh token flow with CognitoUser.refreshSession()
- Handle invalid/expired refresh token errors
- Return new access token (and optionally new refresh token)

### Step 3: Backend - Add Refresh Token Controller Endpoint

- Add POST `/auth/refresh` endpoint to `AuthController`
- Accept refresh token in request body
- Return new access token
- Implement proper error handling for invalid/expired tokens

### Step 4: Frontend - Add Refresh Token API Method

- Add `refreshToken()` method to `ApiClient` class
- Call the new `/auth/refresh` endpoint
- Return the new access token

### Step 5: Backend - Add Tests

- Add unit tests for refresh token service method
- Add unit tests for refresh token controller endpoint
- Test error scenarios (invalid token, expired token)

### Step 6: Frontend - Token Storage Enhancement (Optional)

- Update token storage to include refresh token alongside access token
- Modify login flow to store both tokens

## Detailed Implementation Tasks

### Task 1: Create Refresh Token Request DTO

File: `/apps/backend/src/auth/dtos/refresh-token.request.dto.ts`

- Define class with refreshToken string property
- Add validation decorators (@IsString, @IsNotEmpty)

### Task 2: Implement Service Method

File: `/apps/backend/src/auth/auth.service.ts`

- Add refreshToken method that:
  - Takes refresh token as parameter
  - Creates CognitoUser instance
  - Uses refreshSession to get new tokens
  - Returns SignInResponseDto with new tokens
  - Handles errors appropriately

### Task 3: Add Controller Endpoint

File: `/apps/backend/src/auth/auth.controller.ts`

- Add POST `/refresh` endpoint
- Use RefreshTokenRequestDto for validation
- Call auth service refresh method
- Return token response
- Handle UnauthorizedException for invalid tokens

### Task 4: Frontend API Client Method

File: `/apps/frontend/src/api/apiClient.ts`

- Add refreshToken method to ApiClient class
- Make POST request to `/api/auth/refresh`
- Return new access token

### Task 5: Add Service Tests

File: `/apps/backend/src/auth/auth.service.spec.ts` (create if doesn't exist)

- Test successful refresh token flow
- Test invalid refresh token error
- Test expired refresh token error
- Mock Cognito responses

### Task 6: Add Controller Tests

File: `/apps/backend/src/auth/auth.controller.spec.ts`

- Add tests for refresh endpoint
- Test successful refresh
- Test validation errors
- Test service error handling

## Technical Details

### Cognito Refresh Token Flow

- Use CognitoUser.refreshSession() method
- Requires valid refresh token
- Returns new access token and potentially new refresh token
- Handle CognitoUser creation from refresh token

### Error Handling

- Invalid refresh token -> 401 Unauthorized
- Expired refresh token -> 401 Unauthorized
- Network/service errors -> 500 Internal Server Error
- Validation errors -> 400 Bad Request

### Security Considerations

- Refresh tokens are long-lived, treat as sensitive
- Consider rotating refresh tokens on use
- Implement proper error messages that don't leak information

## Files to Create/Modify

### New Files:

- `/apps/backend/src/auth/dtos/refresh-token.request.dto.ts`

### Modified Files:

- `/apps/backend/src/auth/auth.service.ts`
- `/apps/backend/src/auth/auth.controller.ts`
- `/apps/backend/src/auth/auth.controller.spec.ts`
- `/apps/frontend/src/api/apiClient.ts`

### Test Files to Create:

- `/apps/backend/src/auth/auth.service.spec.ts` (if doesn't exist)
