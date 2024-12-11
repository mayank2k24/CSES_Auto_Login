window.onload = () => {
    // Function to check if the user is already logged in
    function isLoggedIn() {
        return document.querySelector('a[href="/logout"]') !== null;
    }

    if (isLoggedIn()) {
        console.log("User is already logged in, skipping login process");
        return;
    }

    chrome.storage.sync.set({ loginAttempted: false }, () => {
        console.log("Reset loginAttempted flag on page load");

        chrome.storage.sync.get(["username", "password", "iv", "key", "loginAttempted"], ({ username, password, iv, key, loginAttempted }) => {
            console.log("Login attempted:", loginAttempted);

            if (!username || !password || !iv || !key) {
                // Prompt the user for their username and password
                const userUsername = prompt("Please enter your username:");
                const userPassword = prompt("Please enter your password:");

                if (userUsername && userPassword) {
                    // Generate a random encryption key
                    window.crypto.subtle.generateKey(
                        {
                            name: "AES-GCM",
                            length: 256
                        },
                        true,
                        ["encrypt", "decrypt"]
                    ).then(key => {
                        // Export the key to store it
                        window.crypto.subtle.exportKey("jwk", key).then(exportedKey => {
                            // Encrypt the password
                            const encoder = new TextEncoder();
                            const data = encoder.encode(userPassword);
                            const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Initialization vector

                            window.crypto.subtle.encrypt(
                                {
                                    name: "AES-GCM",
                                    iv: iv
                                },
                                key,
                                data
                            ).then(encrypted => {
                                // Store the encrypted password, IV, and key
                                chrome.storage.sync.set({
                                    username: userUsername,
                                    password: Array.from(new Uint8Array(encrypted)),
                                    iv: Array.from(iv),
                                    key: exportedKey
                                }, () => {
                                    console.log("Username and password saved");
                                    performLogin(userUsername, userPassword);
                                });
                            });
                        });
                    });
                } else {
                    console.error("Username or password not provided");
                }
            } else {
                const importedKey = window.crypto.subtle.importKey(
                    "jwk",
                    key,
                    {
                        name: "AES-GCM"
                    },
                    true,
                    ["decrypt"]
                );

                importedKey.then(key => {
                    const ivArray = new Uint8Array(iv);
                    const encryptedPassword = new Uint8Array(password);

                    window.crypto.subtle.decrypt(
                        {
                            name: "AES-GCM",
                            iv: ivArray
                        },
                        key,
                        encryptedPassword
                    ).then(decrypted => {
                        const decoder = new TextDecoder();
                        const decryptedPassword = decoder.decode(decrypted);

                        if (!loginAttempted) {
                            performLogin(username, decryptedPassword);
                        } else {
                            console.log("Login already attempted, skipping login process");
                        }
                    }).catch(error => {
                        console.error("Error decrypting password:", error);
                    });
                }).catch(error => {
                    console.error("Error importing key:", error);
                });
            }
        });
    });

    function performLogin(username, password) {
        console.log("Starting login process");

        // Fetch the login page to get the CSRF token
        fetch('https://cses.fi/login')
            .then(response => {
                console.log("Fetched login page");
                return response.text();
            })
            .then(html => {
                console.log("Parsing login page HTML");
                // Parse the HTML to extract the CSRF token
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const csrfTokenElement = doc.querySelector('input[name="csrf_token"]');
                if (!csrfTokenElement) {
                    throw new Error("CSRF token not found");
                }
                const csrfToken = csrfTokenElement.value;
                console.log("CSRF token:", csrfToken);

                chrome.storage.sync.set({ loginAttempted: true }, () => {
                    console.log("Login attempt started");


                    fetch('https://cses.fi/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: new URLSearchParams({
                            csrf_token: csrfToken,
                            nick: username,
                            pass: password
                        })
                    })
                    .then(response => {
                        if (response.ok) {
                            console.log("Login successful");
                            chrome.storage.sync.set({ loginAttempted: false }, () => {
                                console.log("Reset loginAttempted flag after successful login");
                                window.location.reload();
                            });
                        } else {
                            console.error("Login failed with status:", response.status);
                            chrome.storage.sync.set({ loginAttempted: false });
                        }
                    })
                    .catch(error => {
                        console.error("Error during login:", error);
                        chrome.storage.sync.set({ loginAttempted: false });
                    });
                });
            })
            .catch(error => {
                console.error("Error fetching login page:", error);
                chrome.storage.sync.set({ loginAttempted: false });
            });
    }
};