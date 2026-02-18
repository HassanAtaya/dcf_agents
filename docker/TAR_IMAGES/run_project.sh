#!/usr/bin/env bash
set -euo pipefail

# Determine TAR_IMAGES directory based on this script's location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Using TAR_IMAGES directory: $SCRIPT_DIR"

# Move to TAR_IMAGES directory
cd "$SCRIPT_DIR"

echo "Loading Docker images..."

IMAGES=(
  "docker-mysql_db.tar"
  "docker-java_app.tar"
  "docker-angular_app.tar"
  "docker-python_app.tar"
)

for image in "${IMAGES[@]}"; do
  if [[ -f "$image" ]]; then
    echo "Loading $image..."
    docker load -i "$image"
  else
    echo "WARNING: $image not found, skipping."
  fi
done

echo "All image load attempts completed."

echo "Starting containers with docker compose..."

if docker compose version >/dev/null 2>&1; then
  docker compose up -d
elif command -v docker-compose >/dev/null 2>&1; then
  docker-compose up -d
else
  echo "ERROR: Neither 'docker compose' nor 'docker-compose' is available."
  exit 1
fi

cat <<EOF
Done! All services are (starting) up.
MySQL:   localhost:33306
Java:    localhost:18080
Angular: localhost:14200
Python:  localhost:15000
EOF

