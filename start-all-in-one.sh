#!/bin/bash

# Start MongoDB in the background
echo "Starting MongoDB..."
mongod --fork --logpath /var/log/mongodb.log --dbpath /data/db --bind_ip 127.0.0.1

echo "Waiting for MongoDB to be ready..."
until mongo --eval "print(\"waited for connection\")" >/dev/null 2>&1; do
    sleep 1
done
echo "MongoDB is up!"

# Start Nginx
echo "Starting Nginx frontend..."
nginx

# Start API services
cd /usr/src/app
echo "Running seed script..."
node seed.js

echo "Starting Node APIs..."
node logs-service.js &
node users-service.js &
node costs-service.js &
node about-service.js &

# Wait for background processes to keep the container running
wait
