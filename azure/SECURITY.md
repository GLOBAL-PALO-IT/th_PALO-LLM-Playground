# Security Best Practices for Azure Deployment

This document outlines security considerations and best practices when deploying the Applied LLM Platform to Azure.

## Secrets Management

### Current Implementation
The Bicep template accepts secrets as parameters (e.g., database passwords, API keys) which are marked as `@secure()`. While this provides basic protection, there are more secure alternatives for production deployments.

### Recommended: Azure Key Vault Integration

For production deployments, consider using Azure Key Vault to store and manage secrets:

1. **Create an Azure Key Vault:**
```bash
az keyvault create \
  --name mykeyvault \
  --resource-group Applied-LLM-Platform-rg \
  --location eastus
```

2. **Store secrets in Key Vault:**
```bash
az keyvault secret set --vault-name mykeyvault --name "openai-api-key" --value "YOUR_KEY"
az keyvault secret set --vault-name mykeyvault --name "postgres-password" --value "YOUR_PASSWORD"
```

3. **Reference secrets in Bicep template:**
Instead of passing secrets directly, reference them from Key Vault:
```bicep
resource keyVault 'Microsoft.KeyVault/vaults@2022-07-01' existing = {
  name: 'mykeyvault'
}

var openaiApiKey = keyVault.getSecret('openai-api-key')
```

### Managed Identity (Future Enhancement)

Azure Container Apps supports managed identities for accessing Azure resources without credentials:
- Use managed identity to access Azure Database for PostgreSQL (when fully supported)
- Use managed identity to access Key Vault
- Eliminates the need to manage credentials in the application

## Database Security

### Connection String Security
The Bicep template constructs the database connection string with embedded credentials. For production:

1. **Enable SSL/TLS:** The template uses `?sslmode=require` which is good practice
2. **Restrict Firewall Rules:** The default template allows all Azure services. Update to specific IP ranges:

```bash
az postgres flexible-server firewall-rule create \
  --resource-group Applied-LLM-Platform-rg \
  --name Applied-LLM-Platform-postgres \
  --rule-name AllowMyIP \
  --start-ip-address YOUR_IP \
  --end-ip-address YOUR_IP
```

3. **Use Azure AD Authentication:** Configure Azure AD authentication for the database instead of SQL authentication

### Database Encryption
- **At-rest encryption:** Enabled by default in Azure Database for PostgreSQL
- **In-transit encryption:** Enforced via SSL/TLS connection

## Network Security

### Current Setup
- Container Apps are exposed to the internet via HTTPS
- Internal services communicate within the Container Apps Environment

### Recommended Enhancements

1. **Virtual Network Integration:**
   - Deploy Container Apps in a VNET
   - Use private endpoints for PostgreSQL
   - Implement network security groups (NSGs)

2. **Web Application Firewall (WAF):**
   - Add Azure Front Door or Application Gateway with WAF
   - Protect against common web vulnerabilities

3. **DDoS Protection:**
   - Enable Azure DDoS Protection Standard for production

## Authentication & Authorization

### Application-Level Security
The current deployment doesn't include authentication. For production:

1. **Azure AD Integration:**
   - Use Azure AD for user authentication
   - Implement role-based access control (RBAC)

2. **API Management:**
   - Deploy Azure API Management for API security
   - Implement rate limiting and throttling
   - Add OAuth2/OpenID Connect

## Monitoring & Security Auditing

### Current Setup
- Log Analytics workspace for application logs
- Basic monitoring enabled

### Recommended Enhancements

1. **Enable Azure Security Center:**
```bash
az security auto-provisioning-setting update --name default --auto-provision on
```

2. **Configure diagnostic settings for all resources**

3. **Set up alerts for security events:**
   - Failed authentication attempts
   - Unusual database access patterns
   - High resource consumption

4. **Enable Azure Defender:**
   - For Container Apps
   - For PostgreSQL database
   - For Container Registry (if using ACR)

## Sensitive Data Handling

### Environment Variables
- Never commit `.env` files or local parameter files
- Use Azure Key Vault for production secrets
- Rotate secrets regularly

### Code Security
1. **Dependency scanning:**
```bash
npm audit
```

2. **Container image scanning:**
```bash
az acr task create \
  --registry myregistry \
  --name security-scan \
  --image myapp:latest \
  --cmd "trivy image --severity HIGH,CRITICAL myapp:latest"
```

## Compliance & Data Residency

### Data Location
- Ensure your Azure region complies with data residency requirements
- Available regions: https://azure.microsoft.com/global-infrastructure/geographies/

### Compliance Certifications
Azure provides various compliance certifications:
- GDPR (EU)
- HIPAA (Healthcare)
- SOC 2
- ISO 27001

## Regular Security Updates

1. **Keep base images updated:**
   - Regularly rebuild Docker images with latest Node.js patches
   - Update npm dependencies: `npm update`

2. **Monitor security advisories:**
   - GitHub Security Advisories
   - Azure Security Updates
   - NPM security alerts

3. **Automated patching:**
   - Enable automated OS patching for Container Apps
   - Use Azure Update Management

## Incident Response

### Preparation
1. Document incident response procedures
2. Set up security contact alerts
3. Configure Azure Sentinel for SIEM capabilities

### Backup & Recovery
1. **Database backups:**
   - Azure PostgreSQL provides automated backups (7 days retention by default)
   - Test restore procedures regularly

2. **Application state:**
   - Store application state externally
   - Use Azure Storage for persistent data

## Production Checklist

Before deploying to production, ensure:

- [ ] Secrets are stored in Azure Key Vault
- [ ] Database firewall rules are restrictive
- [ ] SSL/TLS is enforced for all connections
- [ ] Monitoring and alerting are configured
- [ ] RBAC is properly configured
- [ ] Regular backups are tested
- [ ] Security updates are automated
- [ ] Compliance requirements are met
- [ ] Incident response plan is documented
- [ ] Network isolation is implemented (VNET)

## Resources

- [Azure Security Best Practices](https://docs.microsoft.com/azure/security/fundamentals/best-practices-and-patterns)
- [Container Apps Security](https://docs.microsoft.com/azure/container-apps/security-baseline)
- [Azure PostgreSQL Security](https://docs.microsoft.com/azure/postgresql/flexible-server/concepts-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
