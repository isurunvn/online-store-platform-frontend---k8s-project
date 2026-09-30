import { useKeycloak } from '@react-keycloak/web';

export const useAuth = () => {
  const { keycloak, initialized } = useKeycloak();

  const isAuthenticated = !!keycloak.authenticated;
  
  const isAdmin = keycloak.hasRealmRole('ADMIN');
  const isCustomer = keycloak.hasRealmRole('CUSTOMER');

  const login = () => keycloak.login();
  const logout = () => keycloak.logout();

  return {
    keycloak,
    initialized,
    isAuthenticated,
    isAdmin,
    isCustomer,
    login,
    logout,
    token: keycloak.token,
    tokenParsed: keycloak.tokenParsed,
  };
};
