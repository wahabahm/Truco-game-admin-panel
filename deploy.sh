#!/bin/bash

# Deployment Script for Hostinger
# This script helps prepare your application for deployment

echo "🚀 Preparing Truco Admin Panel for Hostinger Deployment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Build Frontend
echo -e "${YELLOW}Step 1: Building Frontend...${NC}"
npm run build:prod
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend built successfully!${NC}"
else
    echo -e "${RED}✗ Frontend build failed!${NC}"
    exit 1
fi

# Step 2: Check environment files
echo ""
echo -e "${YELLOW}Step 2: Checking environment files...${NC}"
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}✗ backend/.env file not found!${NC}"
    echo "Please create backend/.env file with your production configuration."
    exit 1
else
    echo -e "${GREEN}✓ backend/.env file exists${NC}"
fi

if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠ .env.production file not found${NC}"
    echo "Creating .env.production from template..."
    cp env.production.example .env.production
    echo -e "${YELLOW}Please update .env.production with your API URL${NC}"
fi

# Step 3: Check Node.js version
echo ""
echo -e "${YELLOW}Step 3: Checking Node.js version...${NC}"
node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -ge 18 ]; then
    echo -e "${GREEN}✓ Node.js version is compatible (v${node_version})${NC}"
else
    echo -e "${RED}✗ Node.js version must be 18 or higher (current: v${node_version})${NC}"
    exit 1
fi

# Step 4: Create deployment package info
echo ""
echo -e "${YELLOW}Step 4: Creating deployment package...${NC}"
echo "Files ready for deployment:"
echo "  - dist/ folder (frontend)"
echo "  - backend/ folder (backend)"
echo ""
echo -e "${GREEN}✓ Deployment package ready!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Upload dist/ folder contents to public_html/"
echo "2. Upload backend/ folder to your server"
echo "3. Install backend dependencies: cd backend && npm install --production"
echo "4. Setup Node.js app in Hostinger hPanel"
echo "5. Configure environment variables"
echo "6. Start the backend server"

