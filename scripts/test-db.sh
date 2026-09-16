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

psql -U "$PSQL_USER" -d "$DB" -v ON_ERROR_STOP=1 -f supabase/tests/_bootstrap.sql

# Only the migrations this test suite actually exercises. Migrations
# after 0003 introduce dependencies this lightweight stub doesn't
# reproduce (0004 needs Supabase's real storage.buckets/storage.objects
# schema) — reproducing the whole platform locally would be the
# premature-infrastructure mistake the project's own dev plan warns
# against. For full-stack coverage across every migration, use the
# Supabase CLI's local stack (`supabase start`) instead, which
# provisions storage/auth for real; `supabase test db` runs pgTAP
# suites against it with the same test files, unchanged.
for migration in \
  supabase/migrations/0001_init.sql \
  supabase/migrations/0003_save_campus_life_section_rpc.sql \
  supabase/migrations/0007_fix_save_campus_life_section_ordinality.sql
do
  echo "-- applying $migration"
  psql -U "$PSQL_USER" -d "$DB" -v ON_ERROR_STOP=1 -f "$migration"
done
psql -U "$PSQL_USER" -d "$DB" -c "create extension if not exists pgtap;"

pg_prove -U "$PSQL_USER" -d "$DB" supabase/tests/*.test.sql