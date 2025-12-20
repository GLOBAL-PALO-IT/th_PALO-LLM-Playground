# Azure Deployment Files

This directory contains Azure Resource Manager (ARM) templates and configuration files for deploying the PALO LLM Playground to Azure Container Apps.

## Files

- **azuredeploy.json** - Main ARM template that defines all Azure resources
- **azuredeploy.parameters.json** - Template for deployment parameters (update with your values)
- **deploy.sh** - Interactive deployment script that automates the entire deployment process
- **validate.sh** - Script to validate ARM template syntax locally
- **DEPLOYMENT.md** - Comprehensive deployment guide with step-by-step instructions
- **SECURITY.md** - Security best practices and recommendations for production deployments
- **ARM_TEMPLATE_NOTES.md** - Technical notes on ARM template design decisions and limitations

## Quick Start

### Option 1: Using the Automated Deployment Script (Recommended)

The easiest way to deploy is using the interactive script:

```bash
./azure/deploy.sh
```

The script will:
- Validate prerequisites (Azure CLI, Docker)
- Prompt for all necessary configuration
- Build and push the Docker image
- Create the resource group
- Deploy all Azure resources
- Provide the application URL

### Option 2: Manual Deployment

1. Read the [DEPLOYMENT.md](DEPLOYMENT.md) guide for detailed instructions
2. Copy `azuredeploy.parameters.json` to `azuredeploy.parameters.local.json`
3. Update the parameters with your actual values
4. Deploy using Azure CLI:

```bash
az deployment group create \
  --resource-group <your-resource-group> \
  --template-file azuredeploy.json \
  --parameters azuredeploy.parameters.local.json
```

## Resources Deployed

- Azure Container Apps Environment
- Container App (Next.js application)
- Azure Database for PostgreSQL Flexible Server
- Log Analytics Workspace

## Security Note

Never commit `azuredeploy.parameters.local.json` with actual secrets to version control. The `.gitignore` file should exclude files with `.local.` in the name.

**For production deployments**, review the [SECURITY.md](SECURITY.md) guide which covers:
- Azure Key Vault integration for secrets management
- Managed Identity configuration
- Database security best practices
- Network isolation recommendations
- Monitoring and compliance requirements
