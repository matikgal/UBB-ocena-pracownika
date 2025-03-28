import Keycloak from 'keycloak-js';

// Initialize Keycloak instance
const keycloakConfig = {
  url: 'http://localhost:8080', // Update with your Keycloak server URL
  realm: 'Halo',
  clientId: 'siema'
};

const keycloak = new Keycloak(keycloakConfig);

// We'll remove the initialization here and let AuthContext handle it
// This prevents double initialization which can cause issues

export default keycloak;