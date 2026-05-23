#!/bin/bash
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}===================================================="
echo -e " SHUTTING DOWN AND RESETTING SYSTEM"
echo -e "====================================================${NC}"

# Down with volumes and remove orphan containers
docker-compose down -v --remove-orphans

echo ""
echo -e "${RED}Containers shut down and database volumes wiped successfully.${NC}"
echo ""
