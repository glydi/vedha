# Backend Setup
1. Ensure you have Docker installed and running.
2. Run `docker-compose up -d` in the root directory to start PostgreSQL.
3. Navigate to `backend` and run `./mvnw spring-boot:run` (or use your IDE).

# Frontend Setup
1. Navigate to `frontend`.
2. Run `npm install`.
3. Run `npm run dev`.
4. The app will be available at `http://localhost:5173`.

## Features
- Full CRUD for code snippets.
- Grayscale premium UI.
- PostgreSQL database integration.
- Language selection and basic syntax display.
- Search functionality.
- Dark mode by default (Grayscale).
