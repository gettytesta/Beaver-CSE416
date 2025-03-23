# Beaver-CSE416

This repository is the Lifetime Financial Planner by team Beaver. This project is submitted in partial fulfillment of the course CSE 416.

## Required dependencies

This project is built using the MERN stack. This requires Nodejs and NPM to run.

## How to execute

1. Start backend
    1. Create a .env file within the backend folder of the repository.
    
    .env file should include **BACKEND_PORTNO** field for express server to run on, and **HOST_NAME** field.
            
            # example config.env file
            BACKEND_PORTNO = 3000
            HOST_NAME = "localhost"

    2. Navigate to backend folder
    3. Execute
    
            npm i
            node --env-file=[YOUR .ENV FILE] server.js
        to start backend listener.


2. Start frontend
    1. Navigate to frontend folder.
    2. Execute
    
            npm i
            npx next dev -p [DESIRED PORT]
        to start frontend.
       
Additional Setup frontend (Tailwind CSS and Lucide-React)
1. Tailwind CSS v3 and Lucide React(Icons)
    1. npm install -D tailwindcss@3 postcss autoprefixer
    2. npm install lucide-react


