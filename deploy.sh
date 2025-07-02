
export DOCKER_HOST=tcp://172.16.81.141:2375
docker login registry.bill24.io -u visal -p OuVtE7ueXIDMZ934gCMt
docker compose -p b24-stage up --pull "always" --detach admin_portal