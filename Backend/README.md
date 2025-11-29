# ELSIP Backend

Quick start:

1. Create a PostgreSQL database (elsip_db) and user (elsip).
2. Run SQL: psql -U elsip -d elsip_db -f sql/schema.sql
3. Copy .env.example to .env and edit values.
4. Install deps: npm install
5. Start: node server.js

Admin endpoints require the header `x-api-key: <ADMIN_API_KEY>` as defined in .env
