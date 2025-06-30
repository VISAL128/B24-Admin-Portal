#!/bin/bash

# Bill24 Admin Portal - Authentication Refactor Setup Script
# This script helps set up the refactored authentication system

echo "🚀 Setting up Bill24 Admin Portal Authentication Refactor..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from template..."
    cp .env.example .env
    print_success ".env file created from template"
    print_warning "Please update the .env file with your Keycloak configuration"
else
    print_status ".env file already exists"
fi

# Check if required environment variables are set
print_status "Checking environment configuration..."

required_vars=("KEYCLOAK_URL" "KEYCLOAK_REALM" "KEYCLOAK_CLIENT_ID" "KEYCLOAK_CLIENT_SECRET")
missing_vars=()

for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" .env || grep -q "^${var}=$" .env || grep -q "your-.*-here" .env; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    print_warning "The following environment variables need to be configured:"
    for var in "${missing_vars[@]}"; do
        echo "  - $var"
    done
    print_warning "Please update your .env file before proceeding"
else
    print_success "All required environment variables are configured"
fi

# Check Node.js version
print_status "Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js version: $NODE_VERSION"
else
    print_error "Node.js is not installed. Please install Node.js 18+ to continue."
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
if command -v pnpm &> /dev/null; then
    pnpm install
    print_success "Dependencies installed with pnpm"
elif command -v bun &> /dev/null; then
    bun install
    print_success "Dependencies installed with bun"
elif command -v npm &> /dev/null; then
    npm install
    print_success "Dependencies installed with npm"
else
    print_error "No package manager found. Please install npm, pnpm, or bun."
    exit 1
fi

# Clear old authentication data
print_status "Clearing old authentication data from localStorage..."
cat > clear_auth_data.js << 'EOF'
// Clear old authentication data
const keysToRemove = [
    'keycloak-token',
    'keycloak-refresh-token', 
    'keycloak-id-token',
    'keycloak-user-profile',
    'authenticated-data'
];

keysToRemove.forEach(key => {
    localStorage.removeItem(key);
});

console.log('Old authentication data cleared');
EOF

print_success "Created clear_auth_data.js script (run in browser console if needed)"

# Create run script
print_status "Creating development run script..."
cat > run-dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Bill24 Admin Portal (Development Mode)"
echo "📍 Application will be available at: http://localhost:3002"
echo "🔐 OIDC Callback URL: http://localhost:3002/get-started"
echo "❌ Error Page: http://localhost:3002/auth-error"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Check if using pnpm, bun, or npm
if command -v pnpm &> /dev/null; then
    pnpm dev
elif command -v bun &> /dev/null; then
    bun run dev
else
    npm run dev
fi
EOF

chmod +x run-dev.sh
print_success "Created run-dev.sh script"

# Display summary
echo ""
echo "🎉 Authentication Refactor Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Update your .env file with correct Keycloak configuration"
echo "2. Ensure your Keycloak client is configured with:"
echo "   - Valid Redirect URIs: http://localhost:3002/get-started"
echo "   - Web Origins: http://localhost:3002"
echo "   - Access Type: confidential"
echo "3. Run './run-dev.sh' to start the development server"
echo ""
echo "📚 Documentation:"
echo "- Authentication Refactor: docs/AUTHENTICATION_REFACTOR_IMPLEMENTATION.md"
echo "- Testing Results: docs/AUTHENTICATION_TESTING.md"
echo ""
echo "🔧 Useful Commands:"
echo "- Start dev server: ./run-dev.sh"
echo "- Clear old auth data: Run clear_auth_data.js in browser console"
echo ""
echo "🌐 URLs:"
echo "- Application: http://localhost:3002"
echo "- Login: http://localhost:3002/login"
echo "- Logout: http://localhost:3002/logout"
echo "- Callback: http://localhost:3002/get-started"
echo "- Error page: http://localhost:3002/auth-error"
echo ""

if [ ${#missing_vars[@]} -gt 0 ]; then
    print_warning "⚠️  Don't forget to configure your environment variables!"
else
    print_success "✅ Ready to start development!"
fi
