# Security Guidelines

## Environment Variables

This project uses environment variables to store sensitive configuration data. **NEVER commit `.env` files or hardcode sensitive data in the source code.**

### Required Environment Variables

1. **Database Credentials**

   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

2. **API Keys**

   - `OPENAI_API_KEY` - OpenAI API key
   - `GEMINI_API_KEY` - Google Gemini API key

3. **Authentication**
   - `JWT_SECRET` - Strong secret for JWT tokens (min 32 characters)
   - `ADMIN_USERNAME` - Admin panel username
   - `ADMIN_PASSWORD` - Secure admin panel password

### Setup Instructions

1. Copy `backend/env.example` to `backend/.env`
2. Replace all placeholder values with secure, unique values
3. Never share or commit your `.env` file
4. Use strong passwords and API keys

### Admin Panel Access

- URL: `https://your-domain.com/admin/ai`
- Authentication: Basic HTTP Auth
- Credentials: Set via `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables

### API Security

- All sensitive endpoints require authentication
- Rate limiting is enabled by default
- CORS is configured for production domains
- Input validation and sanitization implemented

## Reporting Security Issues

If you discover a security vulnerability, please contact the maintainers directly rather than opening a public issue.
