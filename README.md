# Online Store frontend

React/Vite storefront with Keycloak PKCE login, catalog, cart, orders, profile and admin catalog.

## Local development

```bash
npm ci
npm test
npm run dev
```

Use http://localhost:5173. Forward Keycloak to localhost:8080 and the Kubernetes Gateway to
localhost:8081. Vite proxies relative /api requests to that Gateway. Local ignored environment
files can override the three VITE_*_SERVICE_URL variables with absolute origins (no /api suffix).
Do not put secrets in VITE variables: they are public browser configuration.

## Production container

The image builds static assets and serves them with NGINX on 8080. It excludes all local .env files.
API URLs are relative to the browser origin; Gateway routes /api to backend and / to this container.
NGINX intentionally returns 404 for /api so missing Gateway routes cannot look like successful API
responses containing HTML. The frontend Service must be accessed through the Gateway for API calls.

The Docker build arguments VITE_KEYCLOAK_URL, VITE_KEYCLOAK_REALM and VITE_KEYCLOAK_CLIENT_ID default
to the existing private login setup. After deployment, forward Gateway port 80 to local 5173 and
keep Keycloak on local 8080. No Keycloak client changes are needed for that URL.

Configure the GitHub prod environment with OCIR_REGISTRY, OCIR_NAMESPACE, OCIR_REPOSITORY and
OCIR_USERNAME/OCIR_AUTH_TOKEN secrets. Run Build ARM64 frontend image for OCIR. Copy the resulting
digest to the GitOps promotion workflow or script. See platform-gitops/FINISH-PROJECT.md.

Checks cover API paths and checkout payload shape; tsc and Vite validate the production build.
Browser checkout still needs live credentials and the deployed backend. Cart state is kept in
sessionStorage to survive the Keycloak redirect, and API calls refresh expiring access tokens.
