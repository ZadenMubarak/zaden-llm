# setup docker

echo "setting it all up"
docker compose up -d
echo "logs"
docker compose logs
echo "ps"
docker compose ps
echo "entering special bash"
docker exec -it postgres bash

echo "once in the special shell copy this command: psql -U postgress"
echo "Change the postgres to your actual postgres username"