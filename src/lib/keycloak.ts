import Keycloak from 'keycloak-js'

const keycloakConfig = {
	url: 'http://localhost:8080',
	realm: 'Halo',
	clientId: 'siema',
}

const keycloak = new Keycloak(keycloakConfig)

export default keycloak
