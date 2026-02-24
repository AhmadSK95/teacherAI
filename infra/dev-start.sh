#!/bin/bash
set -e

echo "=== TeachAssist AI — Dev Start ==="

# Check Node version
NODE_VERSION=$(node -v | cut -d'.' -f1 | tr -d 'v')
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "Error: Node.js 20+ required (found: $(node -v))"
  exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Run checks
echo "Running typecheck..."
npm run typecheck

echo "Running tests..."
npm run test

# Start dev servers
echo "Starting development servers..."
npm run dev
