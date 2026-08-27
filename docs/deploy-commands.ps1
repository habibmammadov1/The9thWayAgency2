# ==============================================================================
# The9thWay Agency - Azure Deployment Commands
# Run these commands in your local PowerShell where Docker Desktop is running!
# ==============================================================================

# 1. Log into the Azure Container Registry
az acr login --name the9thwayacr

# 2. Build the Docker image
docker build -t the9thwayacr.azurecr.io/the9thway-api:latest -f server/Dockerfile ./server

# 3. Push the image to Azure Container Registry
docker push the9thwayacr.azurecr.io/the9thway-api:latest

# 4. Run Prisma database migrations against the Azure DB (your IP is allowed in firewall)
$env:DATABASE_URL="postgresql://the9thwayadmin:bhkQz4ln%3FP%2BRtA1TW6B8%23wSo@the9thway-pg.postgres.database.azure.com:5432/the9thway?sslmode=require"
npx prisma migrate deploy --schema=server/prisma/schema.prisma

# 5. Seed the production database
npx tsx server/prisma/seed.ts

# 6. Update the Container App to use the new image
az containerapp update --name the9thway-api --resource-group the9thway-rg --image the9thwayacr.azurecr.io/the9thway-api:latest

# 7. Check the Container App URL!
# https://the9thway-api.livelyflower-18984ee4.swedencentral.azurecontainerapps.io/health
