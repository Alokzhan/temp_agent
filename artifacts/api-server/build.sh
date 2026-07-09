#!/bin/bash
# Render.com build script for API server

set -e

echo "Installing dependencies..."
pnpm install --frozen-lockfile

echo "Building project..."
pnpm run build

echo "Build complete!"
