SET IMAGE_TAG=beta-1.0.8
SET IMAGE_NAME=registry.bill24.io/b24/admin-portal

@REM npm run build
@REM Remote to Staging server
SET DOCKER_HOST=tcp://172.16.81.141:2375
@REM echo "Building Docker image for admin portal..."
SET DOCKER_DEFAULT_PLATFORM=linux/amd64
docker build -t %IMAGE_NAME%:%IMAGE_TAG% .
docker push %IMAGE_NAME%:%IMAGE_TAG%
@REM Deploying application to staging...
docker compose -p b24-stage up --pull "always" --detach admin_portal
@REM Deployment to staging completed.