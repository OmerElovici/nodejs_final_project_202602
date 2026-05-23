#!/bin/bash
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}===================================================="
echo -e " INITIALIZING COST MANAGER MICROSERVICES"
echo -e "====================================================${NC}"

# Spin up containers
docker-compose up -d --build

echo ""
echo -e "${YELLOW}Waiting for services to become healthy...${NC}"

# Ping loops to verify endpoints are running before completing
for service in "logs:3001/api/logs" "users:3002/api/users" "costs:3003/api/costs" "about:3004/api/about" "ui:8080"
do
  name=$(echo $service | cut -d':' -f1)
  addr=$(echo $service | cut -d':' -f2)
  
  attempts=0
  until curl -s -o /dev/null --connect-timeout 2 "http://localhost:${addr}" || [ $attempts -eq 15 ]; do
    echo -e "  Waiting for ${name} on port ${addr}... ($((attempts+1))/15)"
    sleep 2
    attempts=$((attempts+1))
  done
  
  if curl -s -o /dev/null --connect-timeout 2 "http://localhost:${addr}" ; then
    echo -e "  ✓ ${GREEN}${name}${NC} is up -> ${BLUE}http://localhost:${addr}${NC}"
  else
    echo -e "  ✗ ${name} failed to respond in time."
  fi
done

echo ""
echo -e "${GREEN}System is ready for presentation!${NC}"
echo -e "Web interface url: ${BLUE}http://localhost:8080${NC}"
echo ""
