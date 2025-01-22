# Polling Application

A modern polling application built with Next.js frontend and Rust backend, featuring secure authentication with passkeys, real-time poll updates, and interactive poll management capabilities.

## Features

- **Secure Authentication**: Implementation of WebAuthn/passkeys for passwordless authentication
- **Poll Management**: Create, manage, and participate in polls
- **Live Results**: Real-time poll result updates
- **User Dashboard**: Personal dashboard to track and manage polls
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## Tech Stack

### Frontend
- Next.js 15.1.4
- React 19
- TypeScript
- Tailwind CSS
- @simplewebauthn/browser for WebAuthn implementation
- Zustand

### Backend
- Rust
- Tokio for async runtime
- Actix Web
- WebAuthn-rs for passkey authentication
- UUID for unique identifiers
- Custom state management implementation

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm (v9 or higher)
- Rust (latest stable version)
- Cargo (comes with Rust)

## Installation

Clone the repository:
```bash
git clone https://github.com/sriramsenthill/polling-application.git
cd polling-application
```

### Frontend Setup (Client)
```bash
cd client
npm install
```

Create a `.env` file in the client directory with necessary environment variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Backend Setup (Server)
```bash
cd server
cargo build
```

## Running the Application

### Start the Backend Server
```bash
cd server
cargo run
```
The server will start on `localhost:8080`

### Start the Frontend Development Server
```bash
cd client
npm run dev
```
The frontend will be available at `localhost:3000`


## Usage

1. Create an account using passkeys (WebAuthn)
2. Log in to your account
3. Create new polls or participate in existing ones
4. View real-time results and manage your polls
5. Track participation and engagement through the dashboard

## Development

### Frontend Development
```bash
cd client
npm run dev     # Start development server
npm run build   # Create production build
npm run start   # Start production server
npm run lint    # Run linting
```

### Backend Development
```bash
cd server
cargo check     # Check for errors
cargo test      # Run tests
cargo run       # Run development server
cargo build     # Build for production
```

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Create a Pull Request

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
