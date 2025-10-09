import { createContext } from 'react';

export interface LoginContextType {
  setToken: (token: string) => void;
  token: string;
}

// Login Context is used to store user's access token
const LoginContext = createContext<LoginContextType | null>(null);
export default LoginContext;
