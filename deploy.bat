echo "Deploying application to demo..."
@REM Remote to demo server
SET DOCKER_HOST=tcp://172.16.81.141:2375
docker compose -p b24-stage up --pull "always" --detach admin_portal