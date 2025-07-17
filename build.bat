SET DOCKER_DEFAULT_PLATFORM=linux/amd64
set NODE_OPTIONS=--no-deprecation
npm run build
docker build -t registry.bill24.io/b24/admin-portal:beta-1.4 .
docker push registry.bill24.io/b24/admin-portal:beta-1.4