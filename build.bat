SET DOCKER_DEFAULT_PLATFORM=linux/amd64
npm run build
docker build -t registry.bill24.io/b24/admin-portal:beta-1.0 .
docker push registry.bill24.io/b24/admin-portal:beta-1.0