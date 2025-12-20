# Azure Container Apps Deployment Guide

This guide explains how to deploy the PALO LLM Playground to Azure Container Apps using the provided ARM template.

## Overview

The ARM template deploys the following Azure resources:

1. **Azure Container Apps Environment** - Manages the container apps
2. **Container App** - Runs the Next.js application
3. **Azure Database for PostgreSQL Flexible Server** - PostgreSQL database for Prisma
4. **Log Analytics Workspace** - For monitoring and logging

## Prerequisites

- Azure subscription
- Azure CLI installed ([Install Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli))
- Docker installed (for building the container image)
- Azure Container Registry (ACR) or Docker Hub account

## Step 1: Build and Push Docker Image

### Option A: Using Azure Container Registry (Recommended)

1. Create an Azure Container Registry:

```bash
az acr create \
  --resource-group <your-resource-group> \
  --name <your-registry-name> \
  --sku Basic
```

2. Log in to ACR:

```bash
az acr login --name <your-registry-name>
```

3. Build and push the image:

```bash
# Build the image
docker build -t <your-registry-name>.azurecr.io/palo-llm-playground:latest .

# Push the image
docker push <your-registry-name>.azurecr.io/palo-llm-playground:latest
```

### Option B: Using Docker Hub

1. Log in to Docker Hub:

```bash
docker login
```

2. Build and push the image:

```bash
# Build the image
docker build -t <your-dockerhub-username>/palo-llm-playground:latest .

# Push the image
docker push <your-dockerhub-username>/palo-llm-playground:latest
```

## Step 2: Prepare Parameters File

Copy the parameters template and update with your values:

```bash
cp azure/azuredeploy.parameters.json azure/azuredeploy.parameters.local.json
```

Edit `azure/azuredeploy.parameters.local.json` and replace the following placeholders:

- `YOUR_REGISTRY.azurecr.io` - Your container registry URL
- `YOUR_REGISTRY_USERNAME` - Your registry username (for ACR, get it from the Access Keys section)
- `YOUR_REGISTRY_PASSWORD` - Your registry password (for ACR, get it from the Access Keys section)
- `YOUR_POSTGRES_PASSWORD` - A strong password for PostgreSQL (minimum 8 characters)
- `YOUR_OPENAI_API_KEY` - Your OpenAI API key
- Optional: Add LiveKit, Tavily, and Serper API keys if needed

**Note:** For Docker Hub public images, you can leave `containerRegistry`, `containerRegistryUsername`, and `containerRegistryPassword` as empty strings.

## Step 3: Deploy to Azure

1. Log in to Azure:

```bash
az login
```

2. Create a resource group (if it doesn't exist):

```bash
az group create \
  --name palo-llm-playground-rg \
  --location eastus
```

3. Deploy the ARM template:

```bash
az deployment group create \
  --resource-group palo-llm-playground-rg \
  --template-file azure/azuredeploy.json \
  --parameters azure/azuredeploy.parameters.local.json
```

The deployment will take approximately 10-15 minutes.

## Step 4: Run Database Migrations

After the deployment completes, you need to run Prisma migrations:

1. Get the container app name:

```bash
az containerapp list \
  --resource-group palo-llm-playground-rg \
  --query "[].name" \
  --output tsv
```

2. Execute the migration command:

```bash
az containerapp exec \
  --resource-group palo-llm-playground-rg \
  --name <container-app-name> \
  --command "npx prisma migrate deploy"
```

Alternatively, you can run migrations locally if you have access to the database:

```bash
# Set the DATABASE_URL from Azure
export DATABASE_URL="<connection-string-from-azure>"

# Run migrations
npx prisma migrate deploy
```

## Step 5: Verify Deployment

1. Get the application URL:

```bash
az deployment group show \
  --resource-group palo-llm-playground-rg \
  --name azuredeploy \
  --query properties.outputs.containerAppUrl.value \
  --output tsv
```

2. Open the URL in your browser to verify the application is running.

## Step 6: View Logs

To view application logs:

```bash
az containerapp logs show \
  --resource-group palo-llm-playground-rg \
  --name <container-app-name> \
  --follow
```

Or use Azure Portal:
1. Navigate to your Container App
2. Go to "Logs" in the left menu
3. Use Log Analytics to query logs

## Monitoring and Scaling

### Auto-scaling

The template is configured with auto-scaling based on HTTP traffic:
- Minimum replicas: 1
- Maximum replicas: 3
- Scaling trigger: 10 concurrent requests per instance

You can modify these values in the parameters file.

### Monitoring

The deployment includes a Log Analytics workspace for monitoring. You can view:
- Application logs
- System logs
- Metrics (CPU, memory, request rates)

Access monitoring through:
- Azure Portal > Container App > Monitoring
- Log Analytics workspace

## Updating the Application

To deploy a new version:

1. Build and push a new image with a new tag:

```bash
docker build -t <your-registry>.azurecr.io/palo-llm-playground:v2 .
docker push <your-registry>.azurecr.io/palo-llm-playground:v2
```

2. Update the container app:

```bash
az containerapp update \
  --resource-group palo-llm-playground-rg \
  --name <container-app-name> \
  --image <your-registry>.azurecr.io/palo-llm-playground:v2
```

## Environment Variables

The following environment variables are automatically configured:

- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key
- `LIVEKIT_API_KEY` - LiveKit API key (optional)
- `LIVEKIT_API_SECRET` - LiveKit API secret (optional)
- `LIVEKIT_URL` - LiveKit URL (optional)
- `TAVILY_API_KEY` - Tavily API key (optional)
- `SERPER_API_KEY` - Serper API key (optional)
- `NODE_ENV` - Set to "production"
- `PORT` - Set to 3000
- `NEXT_PUBLIC_API_URL` - Auto-generated from the container app URL

## Additional Services

This deployment includes only the core application and PostgreSQL database. For the full functionality, you may need to deploy additional services separately:

1. **Qdrant Vector Database** - Can be deployed as a separate container app or use Qdrant Cloud
2. **Neo4j Graph Database** - Can be deployed as a separate container app or use Neo4j Aura
3. **Twilio** - External service, add credentials in parameters if needed

## Security Considerations

1. **Secrets Management**: Consider using Azure Key Vault for managing secrets instead of parameters
2. **Database Access**: The template allows Azure services to access the database. For production, configure more restrictive firewall rules
3. **HTTPS**: The container app is configured to use HTTPS by default
4. **Authentication**: Consider adding authentication to the container app using Azure AD

## Troubleshooting

### Container fails to start

1. Check container logs:
```bash
az containerapp logs show --resource-group palo-llm-playground-rg --name <container-app-name>
```

2. Verify environment variables are set correctly

3. Ensure the database connection string is correct

### Database connection issues

1. Verify the PostgreSQL firewall rules allow Azure services
2. Check the database connection string format
3. Ensure the database exists and migrations have been run

### Out of memory errors

Increase the memory allocation in the ARM template:
```json
"resources": {
  "cpu": 1.0,
  "memory": "2Gi"
}
```

## Costs

Estimated monthly costs (as of 2024, may vary by region):

- **Container Apps**: ~$15-30/month (depends on usage and scaling)
- **PostgreSQL Flexible Server (B1ms)**: ~$12-15/month
- **Log Analytics**: ~$2-5/month (depends on data ingestion)

**Total: Approximately $30-50/month**

For development/testing, you can reduce costs by:
- Setting minReplicas to 0 (scale to zero when not in use)
- Using a smaller PostgreSQL SKU
- Reducing log retention period

## Clean Up

To delete all resources:

```bash
az group delete --name palo-llm-playground-rg --yes --no-wait
```

## References

- [Azure Container Apps Documentation](https://docs.microsoft.com/en-us/azure/container-apps/)
- [Azure Database for PostgreSQL](https://docs.microsoft.com/en-us/azure/postgresql/)
- [ARM Template Reference](https://docs.microsoft.com/en-us/azure/templates/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
