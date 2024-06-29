# Team Members API

This is a Node.js Express API that manages team members using Supabase as the database. It provides endpoints for creating, reading, updating, and deleting team member records.

## Features

- Get all members with pagination, search, and sorting
- Get a specific member by ID
- Add a new member
- Update an existing member
- Delete multiple members

## Prerequisites

- Node.js
- npm
- Supabase account and project

## Installation

1. Clone the repository:
2. Navigate to the project directory:
3. Install dependencies:
4. Create a `.env` file in the root directory and add your Supabase credentials:

## Usage

Start the server:
The server will run on `http://localhost:3000` by default.

## API Endpoints

- `GET /members`: Get all members (with pagination, search, and sorting)
- `GET /members/:id`: Get a specific member by ID
- `POST /members`: Add a new member
- `PUT /members/:id`: Update an existing member
- `POST /members/delete`: Delete multiple members

## Environment Variables

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase project's anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase project's service role key

## CORS Configuration

The API is configured to accept requests from `http://localhost:3001`. Update the `corsOptions` in the code if your frontend is running on a different URL.

## Error Handling

The API includes basic error handling and validation. Errors are returned with appropriate HTTP status codes and error messages.

## Security Note

Ensure that your `.env` file is included in your `.gitignore` to keep your Supabase credentials secure.

## License

[MIT License](LICENSE)
