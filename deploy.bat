echo "Deploying application to demo..."
@REM Remote to demo server
SET DOCKER_HOST=tcp://192.168.196.19:2345
docker compose -p b24-demo up -d --build