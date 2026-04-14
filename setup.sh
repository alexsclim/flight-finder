#!/bin/bash

echo "🚀 Setting up Award Seat Alerts..."

# Check dependencies
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL client not found (psql), but you can still use DATABASE_URL"
fi

echo "✅ Dependencies found"

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your credentials"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup backend database
echo "🗄️  Setting up database..."
cd backend
npm run db:push
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start development:"
echo "  npm run dev"
echo ""
echo "Or run individually:"
echo "  Backend: cd backend && npm run dev"
echo "  Frontend: cd frontend && npm run dev"
