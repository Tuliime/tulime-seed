const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");

const products = JSON.parse(fs.readFileSync("agroProducts.json", "utf8")).data;

const baseURL = "https://tulime-backend.onrender.com/api/v0.01/agroproducts";

const authToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MzcyNjYzODksImlhdCI6MTczNzIyMzE4OSwidXNlcklEIjoiMjBjMzdmYmEtZmMzYi00MWI0LTg3NGEtODFmMWI0MTFjOGIxIn0.kR9idTix8msegPy456-OQONyAZ4HNN8DdCna_-t_V2I"; // Replace with your actual token

async function postProduct(product) {
  const form = new FormData();
  form.append("name", product.name);
  form.append("category", product.category);
  form.append("file", fs.createReadStream(path.join(__dirname, product.image)));

  try {
    const response = await axios.post(baseURL, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log("postProduct response: ", response.data);
    return response.data.data.id;
  } catch (error) {
    console.error(
      `Failed to post product ${product.name}:`,
      error.response?.data || error.message
    );
    throw error;
  }
}

// TODO: To properly update prices
async function postPrice(productID, price, currency) {
  const priceEndpoint = `${baseURL}/${productID}/price`;

  const body = {
    amounts: price,
    currency: currency,
  };

  try {
    const response = await axios.post(priceEndpoint, body, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log("postPrice response: ", response.data);
    console.log(`Successfully posted price for productID ${productID}`);
  } catch (error) {
    console.error(
      `Failed to post price for productID ${productID}:`,
      error.response?.data || error.message
    );
    throw error;
  }
}

async function processProducts() {
  for (const product of products) {
    try {
      console.log(`Processing product: ${product.name}`);
      const productID = await postProduct(product);
      console.log(`Product ${product.name} created with ID: ${productID}`);
      await postPrice(productID, product.price, product.currency);
    } catch (error) {
      console.error(`Error processing product ${product.name}:`, error.message);
    }
  }
}

// Execute the main function
processProducts().catch((err) => console.error("Fatal error:", err.message));
