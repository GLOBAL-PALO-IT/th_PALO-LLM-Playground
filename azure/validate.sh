#!/bin/bash

# ARM Template Validation Script
# This script validates the ARM template syntax without deploying

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

print_info "Validating ARM template..."

# Check if jq is available for JSON validation
if command -v jq >/dev/null 2>&1; then
    print_info "Validating JSON syntax with jq..."
    if jq empty azure/azuredeploy.json 2>/dev/null; then
        print_success "ARM template JSON is valid"
    else
        print_error "ARM template JSON is invalid"
        exit 1
    fi
    
    if jq empty azure/azuredeploy.parameters.json 2>/dev/null; then
        print_success "Parameters file JSON is valid"
    else
        print_error "Parameters file JSON is invalid"
        exit 1
    fi
else
    print_info "jq not found, using python for JSON validation..."
    if python3 -m json.tool azure/azuredeploy.json > /dev/null 2>&1; then
        print_success "ARM template JSON is valid"
    else
        print_error "ARM template JSON is invalid"
        exit 1
    fi
    
    if python3 -m json.tool azure/azuredeploy.parameters.json > /dev/null 2>&1; then
        print_success "Parameters file JSON is valid"
    else
        print_error "Parameters file JSON is invalid"
        exit 1
    fi
fi

# Check if Azure CLI is available for template validation
if command -v az >/dev/null 2>&1; then
    print_info "Azure CLI found. To validate against Azure, run:"
    echo "  az deployment group validate \\"
    echo "    --resource-group <your-rg> \\"
    echo "    --template-file azure/azuredeploy.json \\"
    echo "    --parameters azure/azuredeploy.parameters.json"
    echo ""
    echo "Note: You'll need to update the parameters file with valid values first."
else
    print_info "Azure CLI not found. Install it to validate against Azure: https://docs.microsoft.com/cli/azure/install-azure-cli"
fi

print_success "Local validation completed successfully!"
