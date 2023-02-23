const express = require("express");

const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBOnServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running");
    });
  } catch (e) {
    console.log(`Error Message: ${e.message}`);
    process.exit(1);
  }
};
initializeDBOnServer();

const convertSnakeToCamel = (dbResponse) => {
  return {
    movieName: dbResponse["movie_name"],
  };
};

app.get("/movies/", async (request, response) => {
  const getALlMoviesList = `
    SELECT movie_name FROM movie ORDER BY movie_id;
    `;
  const movieArray = await db.all(getALlMoviesList);
  response.send(movieArray.map((eachMovie) => convertSnakeToCamel(eachMovie)));
});

module.exports = app;
