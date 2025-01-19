const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");

const newsList = JSON.parse(fs.readFileSync("news.json", "utf8")).data;

const baseURL = "https://tulime-backend.onrender.com/api/v0.01/news";

const authToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MzczMjY0OTIsImlhdCI6MTczNzI4MzI5MiwidXNlcklEIjoiMjBjMzdmYmEtZmMzYi00MWI0LTg3NGEtODFmMWI0MTFjOGIxIn0.uXwRovdaGm6jtznVT_8nCvUnkXiTmpQS63ZtzyAJs7A";

async function postNews(news) {
  const form = new FormData();
  form.append("title", news.title);
  form.append("category", news.category);
  form.append("source", news.source);
  form.append("file", fs.createReadStream(path.join(__dirname, news.image)));

  try {
    const response = await axios.post(baseURL, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log("postNews response: ", response.data);
    return response.data.data.id;
  } catch (error) {
    console.error(
      `Failed to post product ${news.title}:`,
      error.response?.data || error.message
    );
    throw error;
  }
}

async function processNews() {
  for (const news of newsList) {
    try {
      console.log(`Processing news: ${news.title}`);
      const newsID = await postNews(news);
      console.log(`News ${news.title} created with ID: ${newsID}`);
    } catch (error) {
      console.error(`Error processing product ${news.title}:`, error.message);
    }
  }
}

processNews().catch((err) => console.error("Fatal error:", err.message));
