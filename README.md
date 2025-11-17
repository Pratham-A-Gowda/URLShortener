# Shortly - URL Shortener

> A professional full-stack URL shortening service with a polished UI, admin panel, QR code generation and analytics charts.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [Docker](https://www.docker.com/) and Docker Compose
- Git

## 🚀 Getting Started

Follow these steps to set up and run the application:

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd URL_Shortener
```

### Step 2: Configure Environment Variables

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file with your preferred settings:
   - Set `SEED_ADMIN_EMAIL` (e.g., `admin@example.com`)
   - Set `SEED_ADMIN_PASSWORD` (e.g., `SecurePassword123!`)
   - Adjust database credentials if needed

### Step 3: Start the Database

1. Return to the project root:

   ```bash
   cd ..
   ```

2. Start PostgreSQL using Docker Compose:

   ```bash
   docker-compose up -d
   ```

3. Verify the container is running:
   ```bash
   docker ps
   ```

### Step 4: Initialize the Database

1. Find your PostgreSQL container name:

   ```bash
   docker ps
   ```

   (Look for the container with the PostgreSQL image)

2. Create the database:

   ```bash
   docker exec -it <postgres_container_name> psql -U postgres -c "CREATE DATABASE shortly_db;"
   ```

3. Create the database user:

   ```bash
   docker exec -it <postgres_container_name> psql -U postgres -c "CREATE USER shortly_user WITH PASSWORD 'ShortlyPass123!';"
   ```

4. Grant privileges:

   ```bash
   docker exec -it <postgres_container_name> psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE shortly_db TO shortly_user;"
   ```

5. Run migrations:
   ```bash
   docker exec -i <postgres_container_name> psql -U shortly_user -d shortly_db < backend/migrations.sql
   ```

### Step 5: Set Up Backend

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Seed the admin user (uses credentials from `.env`):

   ```bash
   npm run seed
   ```

4. Start the backend server:

   ```bash
   npm run dev
   ```

   The backend should now be running on `http://localhost:3000`

### Step 6: Set Up Frontend

1. Open a new terminal and navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and visit:
   ```
   http://localhost:5173
   ```

## 🎯 Usage

### Regular Users

1. Visit the homepage
2. Register for an account or log in
3. Shorten URLs and generate QR codes
4. View analytics for your shortened links

### Admin Users

1. Log in with the admin credentials you set in Step 2
2. Access the Admin Panel from the navigation menu
3. Manage users (promote, demote, delete)
4. View system-wide analytics

## 🔒 Security Notes

- **JWT Authentication**: All protected endpoints require a valid JWT token
- **Admin Routes**: Admin panel endpoints (`/api/admin/*`) require `is_admin=true` in the JWT
- **Production Checklist**:
  - [ ] Change JWT secret to a strong, random value
  - [ ] Enable HTTPS
  - [ ] Use strong database passwords
  - [ ] Implement email verification
  - [ ] Add password reset functionality
  - [ ] Set up proper logging and monitoring

## 🛠️ Technology Stack

**Backend:**

- Node.js & Express
- PostgreSQL
- JWT Authentication

**Frontend:**

- React + Vite
- TailwindCSS
- Chart.js (for analytics)

**DevOps:**

- Docker & Docker Compose

## 📁 Project Structure

```
URL_Shortener/
├── backend/           # Backend API server
│   ├── routes/       # API routes
│   ├── middlewares/  # Auth & other middlewares
│   └── utils/        # Utility functions
├── frontend/          # React frontend
│   └── src/
│       ├── pages/    # Page components
│       ├── context/  # React context providers
│       └── ui/       # Reusable UI components
└── docker-compose.yml # Docker configuration
```

## 🐛 Troubleshooting

**Database connection issues:**

- Verify PostgreSQL container is running: `docker ps`
- Check database credentials in `.env` file
- Ensure migrations were run successfully

**Port conflicts:**

- Backend (port 3000) or Frontend (port 5173) already in use
- Stop other services or change ports in configuration files

**Admin login not working:**

- Verify the seed script ran successfully
- Check that admin credentials match those in `.env`

## 📄 License

This project is open source and available under the MIT License.

---

**Happy Shortening! 🎉**
