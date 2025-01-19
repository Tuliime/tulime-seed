const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");

const farmInputs = JSON.parse(fs.readFileSync("farminputs.json", "utf8")).data;

const baseURL = "https://tulime-backend.onrender.com/api/v0.01/farminputs";

const authToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MzczMjY0OTIsImlhdCI6MTczNzI4MzI5MiwidXNlcklEIjoiMjBjMzdmYmEtZmMzYi00MWI0LTg3NGEtODFmMWI0MTFjOGIxIn0.uXwRovdaGm6jtznVT_8nCvUnkXiTmpQS63ZtzyAJs7A";

async function postFarmInput(farmInput) {
  const form = new FormData();
  form.append("name", farmInput.name);
  form.append("category", farmInput.category);
  form.append("purpose", farmInput.purpose);
  form.append("price", farmInput.price);
  form.append("priceCurrency", farmInput.priceCurrency);
  form.append("source", farmInput.source);
  form.append("sourceUrl", farmInput.sourceUrl);
  form.append(
    "file",
    fs.createReadStream(path.join(__dirname, farmInput.image))
  );

  try {
    const response = await axios.post(baseURL, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log("PostFarmInput response: ", response.data);
    return response.data.data.id;
  } catch (error) {
    console.error(
      `Failed to post farm input ${farmInput.name}:`,
      error.response?.data || error.message
    );
    throw error;
  }
}

async function processFarmInputs() {
  for (const farmInput of farmInputs) {
    try {
      console.log(`Processing farm input: ${farmInput.name}`);
      const farmInputID = await postFarmInput(farmInput);
      console.log(
        `Farm input ${farmInput.name} created with ID: ${farmInputID}`
      );
    } catch (error) {
      console.error(
        `Error processing product ${farmInput.name}:`,
        error.message
      );
    }
  }
}

processFarmInputs().catch((err) => console.error("Fatal error:", err.message));
