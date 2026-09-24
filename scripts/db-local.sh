#!/usr/bin/env bash
set -euo pipefail

BASE="$(cd "$(dirname "$0")/.." && pwd)"
DBDIR="$BASE/.pgdata"
PORT="${PGPORT:-5432}"

case "${1:-start}" in
  start)
    if [ ! -f "$DBDIR/PG_VERSION" ]; then
      echo "Initializing Postgres cluster at $DBDIR..."
      initdb -D "$DBDIR" -U vpwa --auth=trust >/dev/null
    fi
    if ! pg_ctl -D "$DBDIR" status >/dev/null 2>&1; then
      echo "Starting Postgres on port $PORT..."
      pg_ctl -D "$DBDIR" -o "-p $PORT" -l "$DBDIR/logfile" start >/dev/null
    else
      echo "Postgres already running."
    fi
    createdb -p "$PORT" -U vpwa vpwa 2>/dev/null || echo "database 'vpwa' already exists"
    ;;
  stop)
    pg_ctl -D "$DBDIR" stop -m fast || true
    ;;
  *)
    echo "usage: $0 start|stop" >&2
    exit 1
    ;;
esac