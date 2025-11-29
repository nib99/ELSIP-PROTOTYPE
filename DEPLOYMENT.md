# Local Docker Deployment (prototype)
1. Ensure Docker & docker-compose installed.
2. Copy .env values if needed (backend uses docker-compose env).
3. From repo root run: docker-compose up --build -d
4. Initialize DB schema: docker exec -i <db_container> psql -U elsip -d elsip_db < backend/sql/schema.sql
5. Visit API: http://localhost:3000/api/health
