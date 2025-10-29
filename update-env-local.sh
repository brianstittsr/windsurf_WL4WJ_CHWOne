
# This script will update your .env.local file to remove AWS settings
# Run this script with: source ./update-env-local.sh

# Create backup of current .env.local
cp .env.local .env.local.aws-backup

# Remove AWS/Cognito related environment variables
sed -i '/^AWS_/d' .env.local
sed -i '/^NEXT_PUBLIC_AWS_/d' .env.local
sed -i '/^NEXT_PUBLIC_AUTH_PROVIDER=/d' .env.local
sed -i '/^COGNITO_/d' .env.local
sed -i '/^NEXT_PUBLIC_COGNITO_/d' .env.local

echo "Updated .env.local to remove AWS settings"
