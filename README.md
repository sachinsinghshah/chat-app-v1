# Real-Time Chat Application

A full-stack real-time chat application built with the MERN stack (MongoDB, Express.js, React, Node.js) and Socket.IO for real-time communication.

## Features

- **User Authentication**: Secure signup and login functionality
- **Real-time Messaging**: Instant message delivery using Socket.IO
- **Responsive Design**: Built with Tailwind CSS and DaisyUI for a modern UI
- **Protected Routes**: Access control based on authentication status
- **Toast Notifications**: User-friendly notifications with react-hot-toast

## Tech Stack

### Frontend
- **React**: UI library for building the user interface
- **React Router v7**: For client-side routing
- **Socket.IO Client**: For real-time communication
- **Tailwind CSS & DaisyUI**: For styling
- **Vite**: Build tool and development server
- **Zustand**: State management
- **React Icons**: Icon library
- **React Hot Toast**: For notifications

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM (Object Data Modeling) for MongoDB
- **Socket.IO**: For real-time, bidirectional communication
- **JSON Web Token (JWT)**: For authentication
- **bcryptjs**: For password hashing

## Project Structure

```
chat-app/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # Context providers (Auth, Socket)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components
│   │   ├── utils/            # Utility functions
│   │   ├── App.jsx           # Main app component with routes
│   │   └── main.jsx          # Entry point
│   └── ...
├── backend/                  # Express.js backend
│   ├── controllers/          # Request handlers
│   ├── models/               # Mongoose models
│   ├── routes/               # API routes
│   ├── middleware/           # Custom middleware
│   ├── utils/                # Utility functions
│   ├── db/                   # Database connection
│   └── server.js             # Server entry point
├── socket/                   # Socket.IO implementation
│   └── socket.js             # Socket event handlers
└── ...
```

## Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)

### Environment Variables
Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGO_DB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Installation Steps

1. Clone the repository
   ```
   git clone <repository-url>
   cd chat-app
   ```

2. Install dependencies
   ```
   npm install
   cd frontend
   npm install
   cd ..
   ```

3. Run the development server
   ```
   # Run backend server
   npm run server
   
   # Run frontend development server (in a new terminal)
   cd frontend
   npm run dev
   ```

4. Build for production
   ```
   npm run build
   ```

## Deployment

The project is configured for deployment on platforms like Render, Vercel, or Heroku. A `render.yaml` configuration file is included for Render deployment.

## License

This project is licensed under the ISC License.

## Acknowledgements

- [React Documentation](https://react.dev/)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [DaisyUI Documentation](https://daisyui.com/docs/) 