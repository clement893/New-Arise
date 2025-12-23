#!/bin/sh
set -e

# Check if we're in standalone mode (server.js exists in parent directory)
if [ -f ../../server.js ]; then
  echo "Starting in standalone mode..."
  cd ../..
  exec node server.js "$@"
elif [ -f server.js ]; then
  echo "Starting in standalone mode (current directory)..."
  exec node server.js "$@"
else
  echo "Starting in development mode..."
  exec next start "$@"
fi

