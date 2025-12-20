#!/bin/bash

# Azure Container Apps Deployment Script
# This script simplifies the deployment process for the PALO LLM Playground

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
print_info "Checking prerequisites..."

if ! command_exists az; then
    print_error "Azure CLI is not installed. Please install it from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

if ! command_exists docker; then
    print_error "Docker is not installed. Please install it from: https://docs.docker.com/get-docker/"
    exit 1
fi

print_info "All prerequisites are met!"

# Get deployment parameters
echo ""
print_info "Azure Container Apps Deployment Configuration"
echo "=============================================="

# Project name
read -p "Enter project name (default: palo-llm-playground): " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-palo-llm-playground}

# Resource group
read -p "Enter resource group name (default: ${PROJECT_NAME}-rg): " RESOURCE_GROUP
RESOURCE_GROUP=${RESOURCE_GROUP:-${PROJECT_NAME}-rg}

# Location
read -p "Enter Azure region (default: eastus): " LOCATION
LOCATION=${LOCATION:-eastus}

# Container registry
echo ""
print_info "Container Registry Configuration"
echo "1. Azure Container Registry (ACR)"
echo "2. Docker Hub"
echo "3. Other registry"
read -p "Select registry type (1-3): " REGISTRY_TYPE

case $REGISTRY_TYPE in
    1)
        read -p "Enter ACR name (will create if not exists): " ACR_NAME
        REGISTRY_SERVER="${ACR_NAME}.azurecr.io"
        CONTAINER_IMAGE="${REGISTRY_SERVER}/${PROJECT_NAME}:latest"
        ;;
    2)
        read -p "Enter Docker Hub username: " DOCKERHUB_USER
        REGISTRY_SERVER=""
        CONTAINER_IMAGE="${DOCKERHUB_USER}/${PROJECT_NAME}:latest"
        ;;
    3)
        read -p "Enter registry server (e.g., myregistry.azurecr.io): " REGISTRY_SERVER
        read -p "Enter full image name: " CONTAINER_IMAGE
        ;;
esac

# Database credentials
echo ""
print_info "Database Configuration"
read -p "Enter PostgreSQL admin username (default: pgadmin): " POSTGRES_USER
POSTGRES_USER=${POSTGRES_USER:-pgadmin}

read -sp "Enter PostgreSQL admin password (min 8 chars, uppercase, lowercase, number recommended): " POSTGRES_PASSWORD
echo ""

if [ -z "$POSTGRES_PASSWORD" ]; then
    print_error "PostgreSQL password is required"
    exit 1
fi

# Validate password strength
if [ ${#POSTGRES_PASSWORD} -lt 8 ]; then
    print_error "PostgreSQL password must be at least 8 characters long"
    exit 1
fi

if ! [[ "$POSTGRES_PASSWORD" =~ [A-Z] ]]; then
    print_error "PostgreSQL password must contain at least one uppercase letter"
    exit 1
fi

if ! [[ "$POSTGRES_PASSWORD" =~ [a-z] ]]; then
    print_error "PostgreSQL password must contain at least one lowercase letter"
    exit 1
fi

if ! [[ "$POSTGRES_PASSWORD" =~ [0-9] ]]; then
    print_error "PostgreSQL password must contain at least one number"
    exit 1
fi

# Recommend special characters for better security (not required but recommended)
if ! [[ "$POSTGRES_PASSWORD" =~ [^a-zA-Z0-9] ]]; then
    print_warning "Recommended: Password should include special characters for better security"
    read -p "Continue anyway? (yes/no): " CONTINUE
    if [ "$CONTINUE" != "yes" ]; then
        print_info "Please enter a stronger password"
        exit 1
    fi
fi

# OpenAI API Key
echo ""
print_info "API Keys Configuration"
read -sp "Enter OpenAI API Key: " OPENAI_API_KEY
echo ""

if [ -z "$OPENAI_API_KEY" ]; then
    print_error "OpenAI API Key is required"
    exit 1
fi

# Optional API keys
read -p "Enter LiveKit API Key (optional, press Enter to skip): " LIVEKIT_API_KEY
read -p "Enter LiveKit API Secret (optional, press Enter to skip): " LIVEKIT_API_SECRET
read -p "Enter LiveKit URL (optional, press Enter to skip): " LIVEKIT_URL
read -p "Enter Tavily API Key (optional, press Enter to skip): " TAVILY_API_KEY
read -p "Enter Serper API Key (optional, press Enter to skip): " SERPER_API_KEY

# Confirm deployment
echo ""
echo "=============================================="
print_info "Deployment Summary"
echo "=============================================="
echo "Project Name: $PROJECT_NAME"
echo "Resource Group: $RESOURCE_GROUP"
echo "Location: $LOCATION"
echo "Container Image: $CONTAINER_IMAGE"
echo "Registry Server: ${REGISTRY_SERVER:-Docker Hub}"
echo "PostgreSQL User: $POSTGRES_USER"
echo "=============================================="

read -p "Continue with deployment? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    print_warning "Deployment cancelled"
    exit 0
fi

# Login to Azure
print_info "Logging in to Azure..."
az account show >/dev/null 2>&1 || az login

# Create or get resource group
print_info "Creating resource group: $RESOURCE_GROUP"
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --output table

# Build and push Docker image
print_info "Building Docker image..."
docker build -t "$CONTAINER_IMAGE" .

if [ "$REGISTRY_TYPE" == "1" ]; then
    # ACR
    print_info "Creating/using Azure Container Registry: $ACR_NAME"
    az acr create --resource-group "$RESOURCE_GROUP" --name "$ACR_NAME" --sku Basic --location "$LOCATION" 2>/dev/null || true
    
    print_info "Logging in to ACR..."
    az acr login --name "$ACR_NAME"
    
    print_info "Pushing image to ACR..."
    docker push "$CONTAINER_IMAGE"
    
    # Get ACR credentials
    REGISTRY_USERNAME=$(az acr credential show --name "$ACR_NAME" --query "username" -o tsv)
    REGISTRY_PASSWORD=$(az acr credential show --name "$ACR_NAME" --query "passwords[0].value" -o tsv)
elif [ "$REGISTRY_TYPE" == "2" ]; then
    # Docker Hub
    print_info "Pushing image to Docker Hub..."
    docker push "$CONTAINER_IMAGE"
    REGISTRY_USERNAME=""
    REGISTRY_PASSWORD=""
else
    # Other registry
    print_info "Please push the image to your registry manually:"
    echo "  docker push $CONTAINER_IMAGE"
    read -p "Press Enter when done..."
    read -p "Enter registry username: " REGISTRY_USERNAME
    read -sp "Enter registry password: " REGISTRY_PASSWORD
    echo ""
fi

# Create parameters file
print_info "Creating deployment parameters..."
PARAMS_FILE="azure/azuredeploy.parameters.local.json"

cat > "$PARAMS_FILE" <<EOF
{
  "\$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "projectName": {
      "value": "$PROJECT_NAME"
    },
    "location": {
      "value": "$LOCATION"
    },
    "containerImage": {
      "value": "$CONTAINER_IMAGE"
    },
    "containerRegistry": {
      "value": "$REGISTRY_SERVER"
    },
    "containerRegistryUsername": {
      "value": "$REGISTRY_USERNAME"
    },
    "containerRegistryPassword": {
      "value": "$REGISTRY_PASSWORD"
    },
    "postgresAdminUsername": {
      "value": "$POSTGRES_USER"
    },
    "postgresAdminPassword": {
      "value": "$POSTGRES_PASSWORD"
    },
    "postgresDatabaseName": {
      "value": "playground"
    },
    "openaiApiKey": {
      "value": "$OPENAI_API_KEY"
    },
    "livekitApiKey": {
      "value": "$LIVEKIT_API_KEY"
    },
    "livekitApiSecret": {
      "value": "$LIVEKIT_API_SECRET"
    },
    "livekitUrl": {
      "value": "$LIVEKIT_URL"
    },
    "tavilyApiKey": {
      "value": "$TAVILY_API_KEY"
    },
    "serperApiKey": {
      "value": "$SERPER_API_KEY"
    },
    "minReplicas": {
      "value": 1
    },
    "maxReplicas": {
      "value": 3
    }
  }
}
EOF

# Deploy ARM template
print_info "Deploying to Azure Container Apps..."
az deployment group create \
    --resource-group "$RESOURCE_GROUP" \
    --template-file azure/azuredeploy.json \
    --parameters "$PARAMS_FILE" \
    --output table

# Get the application URL
APP_URL=$(az deployment group show \
    --resource-group "$RESOURCE_GROUP" \
    --name azuredeploy \
    --query properties.outputs.containerAppUrl.value \
    --output tsv)

# Run database migrations
print_info "Running database migrations..."
CONTAINER_APP_NAME="${PROJECT_NAME}-app"

print_warning "Please run the following command manually to apply database migrations:"
echo "  az containerapp exec --resource-group $RESOURCE_GROUP --name $CONTAINER_APP_NAME --command 'npx prisma migrate deploy'"

# Clean up sensitive parameters file securely
print_info "Cleaning up temporary files..."
if command_exists shred; then
    shred -vfz -n 3 "$PARAMS_FILE" 2>/dev/null || rm -f "$PARAMS_FILE"
else
    # Overwrite file with random data before deleting
    dd if=/dev/urandom of="$PARAMS_FILE" bs=1 count=$(wc -c < "$PARAMS_FILE") 2>/dev/null || true
    rm -f "$PARAMS_FILE"
fi

# Success message
echo ""
echo "=============================================="
print_info "Deployment Completed Successfully!"
echo "=============================================="
echo "Application URL: $APP_URL"
echo ""
print_info "Next steps:"
echo "1. Run database migrations (see command above)"
echo "2. Visit your application: $APP_URL"
echo "3. Monitor logs: az containerapp logs show --resource-group $RESOURCE_GROUP --name $CONTAINER_APP_NAME --follow"
echo "=============================================="
