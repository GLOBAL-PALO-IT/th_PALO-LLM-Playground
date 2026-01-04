# Azure Bicep Technical Notes

## Why Azure Bicep?

This project has migrated from ARM JSON templates to Azure Bicep for the following benefits:

### Improved Readability
- Cleaner, more concise syntax compared to JSON
- No need for complex string concatenation
- Native support for conditional expressions and loops

### Type Safety
- Strong typing with IntelliSense support
- Compile-time validation
- Better error messages

### Maintainability
- Modular design with easy-to-understand declarations
- Reduced code complexity
- Easier to review and debug

## Key Bicep Features Used

### Conditional Resources
Bicep provides native conditional syntax that's much cleaner than ARM JSON:

```bicep
registries: !empty(containerRegistry) ? [
  {
    server: containerRegistry
    username: containerRegistryUsername
    passwordSecretRef: 'registry-password'
  }
] : []
```

**Contrast with ARM JSON:**
```json
"registries": "[if(empty(parameters('containerRegistry')), json('[]'), json(concat('[{\"server\": \"', parameters('containerRegistry'), '...')))]"
```

### Array Concatenation
Bicep's `concat()` function works naturally with typed arrays:

```bicep
secrets: concat(
  !empty(containerRegistry) ? [
    { name: 'registry-password', value: containerRegistryPassword }
  ] : [],
  [
    { name: 'database-url', value: databaseUrl }
    { name: 'openai-api-key', value: openaiApiKey }
    // ... other secrets
  ]
)
```

### String Interpolation
Bicep supports string interpolation, making connection strings much cleaner:

```bicep
var databaseUrl = 'postgresql://${postgresAdminUsername}:${postgresAdminPassword}@${postgresServerName}.postgres.database.azure.com:5432/${postgresDatabaseName}?sslmode=require'
```

### Resource Dependencies
Bicep automatically infers dependencies, but you can also be explicit:

```bicep
resource containerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: containerAppName
  location: location
  properties: {
    // ...
  }
  dependsOn: [
    postgresServerName_postgresDatabase
    postgresServerName_AllowAllAzureServicesAndResourcesWithinAzureIps
  ]
}
```

### Parameter Decorators
Bicep provides rich metadata and validation through decorators:

```bicep
@description('Minimum number of replicas')
@minValue(0)
@maxValue(25)
param minReplicas int = 1

@secure()
param postgresAdminPassword string
```

## Template Structure

### Variables
Used for computed values that don't change:
```bicep
var environmentName = '${projectName}-env'
var containerAppName = '${projectName}-app'
var logAnalyticsName = '${projectName}-logs'
var postgresServerName = '${projectName}-postgres'
```

### Resources
Each Azure resource is declared with clear type and API version:
```bicep
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logAnalyticsName
  location: location
  properties: {
    // ...
  }
}
```

### Parent-Child Relationships
Bicep simplifies resource hierarchies:
```bicep
resource postgresServerName_postgresDatabase 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2022-12-01' = {
  parent: postgresServer
  name: postgresDatabaseName
  properties: {
    // ...
  }
}
```

## Security Best Practices

### Secure Parameters
Always use `@secure()` decorator for sensitive values:
```bicep
@secure()
param openaiApiKey string

@secure()
param postgresAdminPassword string
```

### Connection String Construction
The template constructs database URLs programmatically:
```bicep
var databaseUrl = 'postgresql://${postgresAdminUsername}:${postgresAdminPassword}@${postgresServerName}.postgres.database.azure.com:5432/${postgresDatabaseName}?sslmode=require'
```

**Production Recommendation:**
- Use Azure Key Vault for secrets
- Reference secrets using Key Vault integration
- Implement Managed Identity for passwordless authentication

## Scaling Configuration

The template includes auto-scaling based on HTTP requests:

```bicep
scale: {
  minReplicas: minReplicas
  maxReplicas: maxReplicas
  rules: [
    {
      name: 'http-scaling'
      http: {
        metadata: {
          concurrentRequests: '10'
        }
      }
    }
  ]
}
```

## Network Configuration

### Container App Ingress
```bicep
ingress: {
  external: true
  targetPort: containerPort
  allowInsecure: false
  traffic: [
    {
      latestRevision: true
      weight: 100
    }
  ]
}
```

This configuration:
- Exposes the app externally
- Uses HTTPS only (allowInsecure: false)
- Routes all traffic to latest revision

## Environment Variables

The template sets all required environment variables as secrets or values:

```bicep
env: [
  {
    name: 'DATABASE_URL'
    secretRef: 'database-url'
  }
  {
    name: 'OPENAI_API_KEY'
    secretRef: 'openai-api-key'
  }
  {
    name: 'NODE_ENV'
    value: 'production'
  }
  // ... more environment variables
]
```

## Outputs

Bicep makes it easy to expose important values:

```bicep
output containerAppFQDN string = reference(containerApp.id, '2023-05-01').configuration.ingress.fqdn
output containerAppUrl string = 'https://${reference(containerApp.id,'2023-05-01').configuration.ingress.fqdn}'
output postgresServerName string = postgresServerName
output postgresFQDN string = reference(postgresServer.id, '2022-12-01').fullyQualifiedDomainName
output databaseName string = postgresDatabaseName
```

## Future Enhancements

Consider these improvements for production:

1. **Modules**: Break into separate Bicep modules
   - Database module
   - Container Apps Environment module
   - Application module

2. **Bicep Registry**: Publish modules to Azure Bicep Registry for versioning

3. **Parameterized SKUs**: Make resource SKUs configurable for different environments

4. **VNET Integration**: Add Virtual Network for enhanced security

5. **Key Vault Integration**: Reference secrets from Key Vault instead of parameters

6. **Private Endpoints**: Use private endpoints for database and other services

## Migration Notes

### From ARM JSON to Bicep

If you have customized the old ARM template, here are key differences:

1. **JSON to Bicep syntax**: Use `az bicep decompile` to convert
2. **String concatenation**: Replace with string interpolation
3. **Conditional expressions**: Use native Bicep ternary operators
4. **Parameters**: Add decorators for better validation
5. **Resource references**: Use symbolic names instead of resource IDs

### Decompiling Existing ARM Templates

If you need to update the old ARM template:
```bash
az bicep decompile --file azuredeploy.json
```

This will generate a Bicep file that you can then refine.

## Development Workflow

### Local Validation
```bash
az bicep build --file azuredeploy.bicep
```

### Preview Changes
```bash
az deployment group what-if \
  --resource-group Applied-LLM-Platform-rg \
  --template-file azuredeploy.bicep \
  --parameters azuredeploy.parameters.local.json
```

### Deploy
```bash
az deployment group create \
  --resource-group Applied-LLM-Platform-rg \
  --template-file azuredeploy.bicep \
  --parameters azuredeploy.parameters.local.json
```

## Resources

- [Azure Bicep Documentation](https://docs.microsoft.com/azure/azure-resource-manager/bicep/)
- [Bicep Playground](https://aka.ms/bicepdemo)
- [Bicep GitHub Repository](https://github.com/Azure/bicep)
- [Container Apps Bicep Reference](https://docs.microsoft.com/azure/templates/microsoft.app/containerapps?pivots=deployment-language-bicep)
- [Bicep Best Practices](https://docs.microsoft.com/azure/azure-resource-manager/bicep/best-practices)

## Comparison: ARM JSON vs Bicep

| Feature | ARM JSON | Bicep |
|---------|----------|-------|
| Readability | Complex, verbose | Clean, concise |
| Type Safety | Runtime errors | Compile-time validation |
| String Manipulation | Complex concatenation | Native interpolation |
| Conditionals | JSON functions | Native ternary operators |
| Tooling | Basic | Excellent (IntelliSense, validation) |
| Learning Curve | Steep | Gentle |
| File Size | Larger | ~50% smaller |

## Conclusion

Azure Bicep provides a significant improvement over ARM JSON templates in terms of readability, maintainability, and developer experience. The migration from ARM to Bicep makes the infrastructure code easier to understand and modify while maintaining full compatibility with Azure Resource Manager.
