# CSES_Auto_Login

## Description

CSES Auto Login is a Chrome extension that automatically logs you into the CSES (Competitive Programming) website. It securely stores your credentials and handles the login process, including fetching and using the CSRF token required for authentication.

## Features

- Automatically logs you into the CSES website.
- Securely stores your username and password using encryption.
- Handles CSRF token required for login.
- Ensures that the login process is only attempted if you are not already logged in.

## Technologies Used

- **JavaScript**: The primary programming language used for the extension.
- **Chrome Extensions API**: Used to interact with the Chrome browser.
- **Web Crypto API**: Used to securely encrypt and decrypt the password.
- **HTML**: Used for the extension's configuration UI (if needed).

## How to Use

1. **Install the Extension**:
   - Clone the repository to your local machine.
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable "Developer mode" using the toggle switch in the top right corner.
   - Click on "Load unpacked" and select the directory where you cloned the repository.

2. **Configure the Extension**:
   - The first time you visit the CSES login page (`https://cses.fi/login`), you will be prompted to enter your username and password.
   - The extension will securely store your credentials using encryption.

3. **Automatic Login**:
   - When you visit the CSES website (`https://cses.fi/`), the extension will automatically log you in if you are not already logged in.

## How It Works

1. **Content Script**:
   - The `content.js` script is injected into the CSES website.
   - It checks if you are already logged in by looking for a specific element (e.g., a logout button).
   - If you are not logged in, it retrieves your stored credentials, decrypts the password, and performs the login process.

2. **Secure Storage**:
   - The username and encrypted password are stored in Chrome's `storage.sync` API.
   - The password is encrypted using the Web Crypto API before being stored.
   - The encryption key and initialization vector (IV) are also stored securely.

3. **Login Process**:
   - The extension fetches the login page to retrieve the CSRF token.
   - It then sends a POST request with the CSRF token, username, and password to log you in.

## Code Structure

- `manifest.json`: The configuration file for the Chrome extension.
- `content.js`: The main script that handles the login process.
- `README.md`: This file, providing information about the project.

## Contributing
If you would like to contribute to this project, please fork the repository and submit a pull request. We welcome all contributions!

## Contact

If you have any questions or feedback, please feel free to do it in issues or send me a mail at [admin@mayankgroup.tech]
