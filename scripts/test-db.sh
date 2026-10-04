#!/usr/bin/env bash
# Builds a disposable local database from the REAL migration files
# (not a mock schema) and runs the pgTAP suite against it. Safe to
# run repeatedly — the database is dropped and recreated every time.
#
# Requires: local Postgres with the pgtap extension available
#   (Ubuntu/Debian: apt install postgresql postgresql-contrib postgresql-<version>-pgtap)
#
# Usage: scripts/test-db.sh
set -euo pipefail

DB=jolnhs_pgtap_test
PSQL_USER=${PGUSER:-postgres}

psql -U "$PSQL_USER" -c "drop database if exists $DB;"
psql -U "$PSQL_USER" -c "create database $DB;"

psql -U "$PSQL_USER" -d "$DB" -v ON_ERROR_STOP=1 -f supabase/migrations/tests/_bootstrap.sql

# Apply the migrations this suite exercises, including the login-rate
# identity fix and the no-hardcoded-admin guardrail.
for migration in \
  supabase/migrations/0001_init.sql \
  supabase/migrations/0005_login_rate_limiting.sql \
  supabase/migrations/0011_login_rate_limit_identity_check.sql \
  supabase/migrations/0012_admin_users_rls.sql \
  supabase/migrations/0003_save_campus_life_section_rpc.sql \
  supabase/migrations/0007_fix_save_campus_life_section_ordinality.sql
do
  echo "-- applying $migration"
  psql -U "$PSQL_USER" -d "$DB" -v ON_ERROR_STOP=1 -f "$migration"
done
psql -U "$PSQL_USER" -d "$DB" -c "create extension if not exists pgtap;"

pg_prove -U "$PSQL_USER" -d "$DB" supabase/migrations/tests/*.test.sql