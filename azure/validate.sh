#!/bin/bash

# Azure Bicep Template Validation Script
# This script validates the Bicep template syntax without deploying

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_info "Validating Bicep template..."

# Check if Azure CLI is available
if ! command -v az >/dev/null 2>&1; then
    print_error "Azure CLI is required for Bicep validation. Install it from: https://docs.microsoft.com/cli/azure/install-azure-cli"
    exit 1
fi

# Validate Bicep syntax
print_info "Building Bicep template to validate syntax..."
if az bicep build --file azure/azuredeploy.bicep --stdout > /dev/null 2>&1; then
    print_success "Bicep template syntax is valid"
else
    print_error "Bicep template has syntax errors"
    echo ""
    print_info "Running build with error output:"
    az bicep build --file azure/azuredeploy.bicep
    exit 1
fi

# Validate parameters file JSON
print_info "Validating parameters file..."
if command -v jq >/dev/null 2>&1; then
    print_info "Validating JSON syntax with jq..."
    if jq empty azure/azuredeploy.parameters.json 2>/dev/null; then
        print_success "Parameters file JSON is valid"
    else
        print_error "Parameters file JSON is invalid"
        exit 1
    fi
else
    print_info "jq not found, using python for JSON validation..."
    if python3 -m json.tool azure/azuredeploy.parameters.json > /dev/null 2>&1; then
        print_success "Parameters file JSON is valid"
    else
        print_error "Parameters file JSON is invalid"
        exit 1
    fi
fi

# Provide information about Azure validation
print_info "To validate the deployment against Azure (without deploying), run:"
echo "  az deployment group validate \\"
echo "    --resource-group <your-rg> \\"
echo "    --template-file azure/azuredeploy.bicep \\"
echo "    --parameters azure/azuredeploy.parameters.json"
echo ""
print_info "Or use 'what-if' to preview changes:"
echo "  az deployment group what-if \\"
echo "    --resource-group <your-rg> \\"
echo "    --template-file azure/azuredeploy.bicep \\"
echo "    --parameters azure/azuredeploy.parameters.json"
echo ""
echo "Note: You'll need to update the parameters file with valid values first."

print_success "Local validation completed successfully!"
