const fs = require('fs');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});
let dBCon;

// Prompt for database password and establish connection
readline.question('Enter password: ', pass => {
    const mysql = require("mysql2");
    dBCon = mysql.createConnection({
        host: "localhost",
        user: "root",
        database: "lifesynchub",
        password: pass
    });
    dBCon.connect(function(err) {
        if (err) throw err;
        console.log("Connected to the database.");
        reviewProduct();
    });
});

async function reviewProduct() {
    // Step 1 & 2: Prompt user for product ID and retrieve product details
    readline.question('Enter product ID to review: ', async productID => {
        try {
            const productDetails = await dBCon.promise().query("SELECT * FROM Products WHERE product_ID = ?", [productID]);
            if (productDetails[0].length === 0) {
                throw new Error("Product not found.");
            }
            console.log("Product found:", productDetails[0]);

            // Step 3 & 4: Retrieve and display existing reviews
            const reviews = await dBCon.promise().query("SELECT * FROM ProductReviews WHERE product_ID = ?", [productID]);
            console.log("Existing reviews:", reviews[0]);

            // Step 5 (Modified for CLI): Assume user is logged in (User ID can be prompted or hardcoded for simplicity)
            // For simplicity, we'll prompt for a user ID here
            readline.question('Enter your user ID: ', userID => {

                // Step 6 & 7: Allow user to write and submit a new review
                readline.question('Write your review: ', async review => {
                    if (!review) {
                        console.log("Review cannot be empty.");
                        readline.close();
                        return;
                    }
                    readline.question('Rate the product (1-5): ', async score => {
                        try {
                            await dBCon.promise().query("INSERT INTO ProductReviews (score, description, user_ID, product_ID) VALUES (?, ?, ?, ?)", [score, review, userID, productID]);
                            console.log("Review submitted successfully!");
                        } catch (error) {
                            console.error("An error occurred while submitting the review:", error.message);
                        } finally {
                            readline.close();
                        }
                    });
                });
            });
        } catch (error) {
            console.error("An error occurred:", error.message);
            readline.close();
        }
    });
}
