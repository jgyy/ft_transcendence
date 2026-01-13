#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

print_info() {
  echo -e "${YELLOW}ℹ $1${NC}"
}

if [ ! -f .env.local ]; then
  print_error ".env.local file not found"
  echo "Please copy .env.example to .env.local and update with your values:"
  echo "  cp .env.example .env.local"
  exit 1
fi

print_success ".env.local file found"

if ! command -v docker &>/dev/null; then
  print_error "Docker is not installed"
  exit 1
fi

print_success "Docker is installed"

if ! docker compose version &>/dev/null; then
  print_error "Docker Compose is not installed"
  exit 1
fi

print_success "Docker Compose is installed"

COMMAND=${1:-help}

case $COMMAND in
start)
  print_info "Starting FT_TRANSCENDENCE services..."
  docker compose up -d
  print_success "Services started"
  echo ""
  echo "Services status:"
  docker compose ps
  echo ""
  print_info "Application available at: https://localhost"
  print_info "WebSocket endpoint: wss://localhost/ws"
  print_info "To view logs: docker compose logs -f"
  ;;

stop)
  print_info "Stopping FT_TRANSCENDENCE services..."
  docker compose down
  print_success "Services stopped"
  ;;

restart)
  print_info "Restarting FT_TRANSCENDENCE services..."
  docker compose restart
  print_success "Services restarted"
  echo ""
  docker compose ps
  ;;

logs)
  SERVICE=${2:-app}
  docker compose logs -f $SERVICE
  ;;

migrate)
  print_info "Running Prisma migrations..."
  docker compose exec -T app npx prisma migrate deploy
  print_success "Migrations completed"
  ;;

seed)
  print_info "Seeding database..."
  docker compose exec -T app npx prisma db seed
  print_success "Database seeded"
  ;;

reset)
  read -p "Are you sure you want to reset the database? This cannot be undone. (yes/no): " -r
  echo
  if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    print_info "Resetting database..."
    docker compose exec -T app npx prisma migrate reset --force
    print_success "Database reset"
  else
    print_info "Reset cancelled"
  fi
  ;;

shell)
  SERVICE=${2:-app}
  print_info "Opening shell in $SERVICE container..."
  docker compose exec $SERVICE sh
  ;;

build)
  print_info "Building Docker images..."
  docker compose build
  print_success "Build completed"
  ;;

ps)
  docker compose ps
  ;;

clean)
  read -p "Are you sure you want to remove all containers and volumes? (yes/no): " -r
  echo
  if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    print_info "Cleaning up Docker resources..."
    docker compose down -v
    print_success "Cleanup completed"
  else
    print_info "Cleanup cancelled"
  fi
  ;;

*)
  echo "FT_TRANSCENDENCE Docker Management Script"
  echo ""
  echo "Usage: ./scripts/docker-setup.sh <command> [options]"
  echo ""
  echo "Commands:"
  echo "  start          Start all services"
  echo "  stop           Stop all services"
  echo "  restart        Restart all services"
  echo "  logs [service] View service logs (default: app)"
  echo "                   Services: app, websocket, postgres, redis, nginx"
  echo "  migrate        Run database migrations"
  echo "  seed           Seed database with sample data"
  echo "  reset          Reset database (removes all data)"
  echo "  shell [service] Open shell in service (default: app)"
  echo "  ps             Show running containers"
  echo "  build          Build Docker images"
  echo "  clean          Remove all containers and volumes"
  echo "  help           Show this help message"
  echo ""
  echo "Examples:"
  echo "  ./scripts/docker-setup.sh start"
  echo "  ./scripts/docker-setup.sh logs websocket"
  echo "  ./scripts/docker-setup.sh shell app"
  echo ""
  ;;
esac
