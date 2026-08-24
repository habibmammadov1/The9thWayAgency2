# Azure Deployment — The9thWay Agency

> **Last updated:** 2026-08-24  
> **Subscription:** Azure for Students ($100 credit)  
> **Frontend:** Vercel (unchanged — see Vercel dashboard)  
> **Backend:** Azure (this document)

---

## Provisioned Resources

| Resource | Azure Name | Type | SKU / Tier | Region |
|---|---|---|---|---|
| Resource Group | `the9thway-rg` | Resource Group | — | `westeurope` |
| Container Registry | `the9thwayacr` | Azure Container Registry | Basic | `westeurope` |
| PostgreSQL Server | `the9thway-pg` | PostgreSQL Flexible Server | Standard_B1ms (Burstable) | `westeurope` |
| Database | `the9thway` | PostgreSQL Database | — | — |
| Container Apps Env | `the9thway-env` | Container Apps Environment | Consumption | `westeurope` |
| Container App | `the9thway-api` | Container App | min 1 replica | `westeurope` |
| Storage Account | `the9thwaystorage` | Azure Storage Account | Standard_LRS | `westeurope` |
| Blob Container | `uploads` | Blob Container | Public blob access | — |

---

## Container App Public URL

```
https://the9thway-api.<unique-id>.westeurope.azurecontainerapps.io
```

> Fill in the actual URL after Phase 4 deployment. Run:
> ```bash
> az containerapp show --name the9thway-api --resource-group the9thway-rg \
>   --query properties.configuration.ingress.fqdn -o tsv
> ```

---

## Environment Variables (Container App Secrets)

Sensitive values are stored as Container Apps **secrets** and referenced via `secretref:`. They are **never** stored in this file or committed to the repo.

| Env Var | Secret Name | Description |
|---|---|---|
| `DATABASE_URL` | `database-url` | PostgreSQL connection string (SSL required) |
| `JWT_SECRET` | `jwt-secret` | Randomly generated 64-char secret for JWT signing |
| `AZURE_STORAGE_CONNECTION_STRING` | `storage-connection-string` | Azure Blob Storage connection string |

Plain (non-secret) env vars set on the Container App:

| Env Var | Value |
|---|---|
| `PORT` | `4000` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | Vercel deployment URL (update when known) |
| `AZURE_STORAGE_CONTAINER` | `uploads` |

---

## Container Registry Image

| Registry | Repository | Tag |
|---|---|---|
| `the9thwayacr.azurecr.io` | `the9thway-api` | `latest` |

Build + push command (builds in Azure cloud, no local Docker resources needed):
```bash
az acr build \
  --registry the9thwayacr \
  --image the9thway-api:latest \
  --file server/Dockerfile \
  ./server
```

---

## Database

- **Host:** `the9thway-pg.postgres.database.azure.com`
- **Admin user:** `the9thwayadmin`
- **Database name:** `the9thway`
- **SSL:** Required (`sslmode=require`)
- **Version:** PostgreSQL 16

### Firewall Rules

| Rule Name | IP Range | Purpose |
|---|---|---|
| `allow-azure-services` | `0.0.0.0` | Container Apps to DB access |
| `allow-my-ip` | Your machine IP | Temporary — for initial migration/seed. **Remove after Phase 3.** |

To remove the temporary IP rule after migration:
```bash
az postgres flexible-server firewall-rule delete \
  --resource-group the9thway-rg \
  --name the9thway-pg \
  --rule-name allow-my-ip \
  --yes
```

---

## Blob Storage

- **Account name:** `the9thwaystorage`
- **Container name:** `uploads`
- **Access level:** Public blob (images are publicly readable by URL)
- **Base URL pattern:** `https://the9thwaystorage.blob.core.windows.net/uploads/<filename>`

---

## Migration Runbook

### Running Migrations (Safe Commands Only)

**Always use `migrate deploy` — never `migrate reset`, `migrate dev`, or `db push`.**

From `server/` directory with the Azure DB connection string:
```bash
DATABASE_URL="postgresql://the9thwayadmin:<PASSWORD>@the9thway-pg.postgres.database.azure.com/the9thway?sslmode=require" \
  npx prisma migrate deploy
```

### Adding a New Migration in Future

1. Make schema changes in `server/prisma/schema.prisma`
2. Run locally against local dev DB:
   ```bash
   npx prisma migrate dev --name describe_your_change
   ```
3. Commit the new migration SQL file
4. Build + push new image to ACR
5. Run `prisma migrate deploy` against Azure DB
6. Update Container App image:
   ```bash
   az containerapp update --name the9thway-api --resource-group the9thway-rg \
     --image the9thwayacr.azurecr.io/the9thway-api:latest
   ```

---

## Redeployment Runbook

```bash
# 1. Build and push new image
az acr build \
  --registry the9thwayacr \
  --image the9thway-api:latest \
  --file server/Dockerfile \
  ./server

# 2. Update the Container App to pull the new image
az containerapp update \
  --name the9thway-api \
  --resource-group the9thway-rg \
  --image the9thwayacr.azurecr.io/the9thway-api:latest

# 3. Verify health
curl https://the9thway-api.<id>.westeurope.azurecontainerapps.io/health
```

---

## Custom Domain Setup (Phase 7 — after domain purchased)

### Frontend (Vercel)
1. Vercel Dashboard > Project > Settings > Domains > Add `the9thway.com`
2. Add DNS records as shown by Vercel (usually A/CNAME)
3. SSL is provisioned automatically by Vercel

### API (Azure Container Apps)
```bash
az containerapp hostname add \
  --name the9thway-api \
  --resource-group the9thway-rg \
  --hostname api.the9thway.com

az containerapp hostname list \
  --name the9thway-api \
  --resource-group the9thway-rg

az containerapp hostname bind \
  --name the9thway-api \
  --resource-group the9thway-rg \
  --hostname api.the9thway.com \
  --environment the9thway-env \
  --validation-method CNAME
```

DNS records to add at your registrar:
| Type | Host | Value |
|---|---|---|
| CNAME | `api` | `the9thway-api.<id>.westeurope.azurecontainerapps.io` |
| TXT | (as shown by hostname list) | verification value |

After custom domain is live, update FRONTEND_URL:
```bash
az containerapp update \
  --name the9thway-api \
  --resource-group the9thway-rg \
  --set-env-vars FRONTEND_URL=https://the9thway.com
```

And update Vercel `NEXT_PUBLIC_API_URL` to `https://api.the9thway.com`.

---

## Cost Estimate (Monthly)

| Resource | Configuration | Est. Cost/Month |
|---|---|---|
| Azure Container Apps | min 1 replica, Consumption plan | ~$10-15 |
| Azure DB for PostgreSQL Flexible Server | Standard_B1ms, 32 GB storage | ~$15-20 |
| Azure Container Registry | Basic SKU | ~$5 |
| Azure Blob Storage | Standard_LRS, <10 GB | <$1 |
| **Total** | | **~$30-41/month** |

**Student credit runway:** At ~$35/month average, the $100 credit lasts approximately **2.5 to 3 months**.

Budget alerts are set at **$50** and **$80** thresholds (see Phase 8).

---

## Health Check URLs

| Endpoint | Expected Response |
|---|---|
| `GET /health` | `{"status":"ok","db":"connected","storage":"azure-blob"}` |
| `GET /api-docs` | Swagger UI HTML (200) |
