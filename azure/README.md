# Azure Deployment Files

This directory contains Azure Resource Manager (ARM) templates and configuration files for deploying the PALO LLM Playground to Azure Container Apps.

## Files

- **azuredeploy.json** - Main ARM template that defines all Azure resources
- **azuredeploy.parameters.json** - Template for deployment parameters (update with your values)
- **DEPLOYMENT.md** - Comprehensive deployment guide with step-by-step instructions

## Quick Start

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
