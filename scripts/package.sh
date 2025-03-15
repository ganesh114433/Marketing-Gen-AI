#!/bin/bash
set -e

# Default values
OUTPUT_DIR="dist"
APP_NAME="marketing-automation"
VERSION=$(date +"%Y%m%d%H%M%S")

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    --output-dir)
      OUTPUT_DIR="$2"
      shift
      shift
      ;;
    --app-name)
      APP_NAME="$2"
      shift
      shift
      ;;
    --version)
      VERSION="$2"
      shift
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Define zip filename
ZIP_FILE="$OUTPUT_DIR/${APP_NAME}-${VERSION}.zip"

# Files and directories to include in the zip
INCLUDE_FILES=(
  "client"
  "server"
  "shared"
  "terraform"
  "scripts"
  ".github"
  "Dockerfile"
  "package.json"
  "package-lock.json"
  "tsconfig.json"
  "vite.config.ts"
  "drizzle.config.ts"
  "postcss.config.js"
  "tailwind.config.ts"
  "theme.json"
  "README.md"
  "cloudbuild.yaml"
)

# Files and directories to exclude
EXCLUDE_FILES=(
  "node_modules"
  "dist"
  ".git"
  "terraform/.terraform"
  "terraform/*.tfstate*"
)

# Build exclude arguments
EXCLUDE_ARGS=""
for item in "${EXCLUDE_FILES[@]}"; do
  EXCLUDE_ARGS="$EXCLUDE_ARGS --exclude=$item"
done

# Create the zip file
echo "Creating deployment package: $ZIP_FILE"
zip -r $EXCLUDE_ARGS "$ZIP_FILE" "${INCLUDE_FILES[@]}"

echo "Package created successfully: $ZIP_FILE"
echo "Total size: $(du -h "$ZIP_FILE" | cut -f1)"