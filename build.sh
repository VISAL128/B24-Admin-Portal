export DOCKER_DEFAULT_PLATFORM=linux/amd64
#export DOCKER_HOST=tcp://172.16.81.141:2375
bun run build
docker build -t registry.bill24.io/b24/admin-portal:beta-1.1 .
docker push registry.bill24.io/b24/admin-portal:beta-1.1