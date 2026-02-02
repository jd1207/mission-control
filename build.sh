# Build script for Railway deployment
# This handles Convex authentication in production

# Check if we're in Railway environment
if [ -n "$RAILWAY_ENVIRONMENT" ]; then
  echo "Running in Railway environment"
  
  # Use Railway-provided env vars
  if [ -n "$NEXT_PUBLIC_CONVEX_URL" ] && [ -n "$CONVEX_DEPLOYMENT" ]; then
    echo "Using Railway environment variables"
    npx convex codegen
    next build
  else
    echo "ERROR: Missing Convex environment variables in Railway"
    exit 1
  fi
else
  echo "Running in local/CI environment"
  # Use local .env.local file
  if [ -f ".env.local" ]; then
    source .env.local
    npx convex codegen
    next build
  else
    echo "ERROR: Missing .env.local file"
    exit 1
  fi
fi