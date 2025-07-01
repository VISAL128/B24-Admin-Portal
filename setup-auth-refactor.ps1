# Bill24 Admin Portal - Authentication Refactor Setup Script (PowerShell)
# This script helps set up the refactored authentication system

Write-Host "🚀 Setting up Bill24 Admin Portal Authentication Refactor..." -ForegroundColor Blue

function Write-Status {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param($Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if .env file exists
if (!(Test-Path ".env")) {
    Write-Warning ".env file not found. Creating from template..."
    Copy-Item ".env.example" ".env"
    Write-Success ".env file created from template"
    Write-Warning "Please update the .env file with your Keycloak configuration"
} else {
    Write-Status ".env file already exists"
}

# Check environment configuration
Write-Status "Checking environment configuration..."

$requiredVars = @("KEYCLOAK_URL", "KEYCLOAK_REALM", "KEYCLOAK_CLIENT_ID", "KEYCLOAK_CLIENT_SECRET")
$missingVars = @()

foreach ($var in $requiredVars) {
    $envContent = Get-Content ".env" -Raw
    if (($envContent -notmatch "^$var=.+") -or ($envContent -match "^$var=$") -or ($envContent -match "your-.*-here")) {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Warning "The following environment variables need to be configured:"
    foreach ($var in $missingVars) {
        Write-Host "  - $var"
    }
    Write-Warning "Please update your .env file before proceeding"
} else {
    Write-Success "All required environment variables are configured"
}

# Check Node.js version
Write-Status "Checking Node.js version..."
try {
    $nodeVersion = node --version
    Write-Success "Node.js version: $nodeVersion"
} catch {
    Write-Error "Node.js is not installed. Please install Node.js 18+ to continue."
    exit 1
}

# Install dependencies
Write-Status "Installing dependencies..."
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    pnpm install
    Write-Success "Dependencies installed with pnpm"
} elseif (Get-Command bun -ErrorAction SilentlyContinue) {
    bun install
    Write-Success "Dependencies installed with bun"
} elseif (Get-Command npm -ErrorAction SilentlyContinue) {
    npm install
    Write-Success "Dependencies installed with npm"
} else {
    Write-Error "No package manager found. Please install npm, pnpm, or bun."
    exit 1
}

# Clear old authentication data
Write-Status "Creating authentication cleanup script..."
@"
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
"@ | Out-File -FilePath "clear_auth_data.js" -Encoding utf8

Write-Success "Created clear_auth_data.js script (run in browser console if needed)"

# Create run script
Write-Status "Creating development run script..."
@"
# Bill24 Admin Portal Development Server
Write-Host "🚀 Starting Bill24 Admin Portal (Development Mode)" -ForegroundColor Blue
Write-Host "📍 Application will be available at: http://localhost:3000" -ForegroundColor Green
Write-Host "🔐 OIDC Callback URL: http://localhost:3000/get-started" -ForegroundColor Yellow
Write-Host "❌ Error Page: http://localhost:3000/auth-error" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Cyan
Write-Host ""

# Check if using pnpm, bun, or npm
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    pnpm dev
} elseif (Get-Command bun -ErrorAction SilentlyContinue) {
    bun run dev
} else {
    npm run dev
}
"@ | Out-File -FilePath "run-dev.ps1" -Encoding utf8

Write-Success "Created run-dev.ps1 script"

# Display summary
Write-Host ""
Write-Host "🎉 Authentication Refactor Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update your .env file with correct Keycloak configuration"
Write-Host "2. Ensure your Keycloak client is configured with:"
Write-Host "   - Valid Redirect URIs: http://localhost:3000/get-started"
Write-Host "   - Web Origins: http://localhost:3000"
Write-Host "   - Access Type: confidential"
Write-Host "3. Run './run-dev.ps1' to start the development server"
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "- Authentication Refactor: docs/AUTHENTICATION_REFACTOR_IMPLEMENTATION.md"
Write-Host "- Testing Results: docs/AUTHENTICATION_TESTING.md"
Write-Host ""
Write-Host "🔧 Useful Commands:" -ForegroundColor Yellow
Write-Host "- Start dev server: ./run-dev.ps1"
Write-Host "- Clear old auth data: Run clear_auth_data.js in browser console"
Write-Host ""
Write-Host "🌐 URLs:" -ForegroundColor Yellow
Write-Host "- Application: http://localhost:3000"
Write-Host "- Login: http://localhost:3000/login"
Write-Host "- Logout: http://localhost:3000/logout"
Write-Host "- Callback: http://localhost:3000/get-started"
Write-Host "- Error page: http://localhost:3000/auth-error"
Write-Host ""

if ($missingVars.Count -gt 0) {
    Write-Warning "⚠️  Don't forget to configure your environment variables!"
} else {
    Write-Success "✅ Ready to start development!"
}
