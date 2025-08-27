# URO Flood Lab Web Platform

A full-stack web application for running and visualizing flood simulation models. This platform provides a user-friendly interface for researchers to upload data, execute complex models, and analyze the results.

## Features

-   **User Authentication:** Secure user registration and login.
-   **Admin Panel:** For user and feedback management.
-   **Model Execution:** Supports various flood models (Inundation, Storm Surge, etc.).
-   **Task Queuing:** Uses RabbitMQ to manage simulation jobs.
-   **Result Visualization:** Interactive plots of simulation results using Plotly.js.
-   **Simulation History:** Tracks user's past simulations.
-   **Feedback System:** Allows users to submit feedback.

## System Architecture

The application uses a microservices-oriented architecture:
1.  **Frontend:** A React single-page application for the user interface.
2.  **Backend:** A Node.js/Express server for API, auth, and job management.
3.  **Model Worker:** A Node.js process that executes simulation tasks from a RabbitMQ queue.

## Technologies Used

-   **Frontend:** React, React Router, Axios, Plotly.js, Tailwind CSS, Vite
-   **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Multer, AMQPLIB
-   **Model Worker:** Node.js, AMQPLIB, `child_process`
-   **Database:** MongoDB
-   **Message Queue:** RabbitMQ

## Prerequisites

-   Node.js (v14+)
-   npm (v6+)
-   MongoDB
-   RabbitMQ

## Installation

1.  Clone the repository:
    ```bash
    git clone [https://github.com/your-username/URO-Flood-Lab-Web-Platform.git](https://github.com/your-username/URO-Flood-Lab-Web-Platform.git)
    cd URO-Flood-Lab-Web-Platform
    ```

2.  **Setup Backend:**
    ```bash
    cd backend
    npm install
    # Create a .env file with PORT, MONGO_URI, JWT_SECRET, RABBITMQ_URI
    ```

3.  **Setup Frontend:**
    ```bash
    cd ../frontend
    npm install
    # Create a .env file with VITE_API_URL pointing to the backend
    ```

4.  **Setup Model Worker:**
    ```bash
    cd ../model-worker
    npm install
    # Create a .env file with RABBITMQ_URI
    ```

## Running the Application

Start each service in a separate terminal:

1.  **Backend:** `cd backend && npm start`
2.  **Frontend:** `cd frontend && npm run dev`
3.  **Model Worker:** `cd model-worker && npm start`

Access the web app via the frontend URL (usually `http://localhost:5173`).

## Project Structure

```
URO-Flood-Lab-Web-Platform/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── ...
└── model-worker/
    ├── models/           # Contains the flood simulation models (e.g., FloodModel)
    └── worker.js         # Consumes jobs and runs models
```

## API Endpoints

Key endpoints are prefixed with `/api`.
-   `POST /auth/signup`
-   `POST /auth/login`
-   `POST /models/run`
-   `GET /models/status/:id`
-   `GET /models/results/:id`
-   `GET /history`
-   `POST /feedback`

## Contributing

Contributions are welcome. Please fork the repository and submit a pull request.
