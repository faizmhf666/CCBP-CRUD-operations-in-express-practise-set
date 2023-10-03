const express = require("express");

const app = express();
app.use(express.json());

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
    movieName: dbResponse.movie_name,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const movieId = request.params.movieId;
  const getMovieByIdQuery = `
    SELECT * FROM movie WHERE movie_id = ?;
  `;
  try {
    const movieArray = await db.all(getMovieByIdQuery, [movieId]);
    if (movieArray.length === 0) {
      response.status(404).json({ error: "Movie not found" });
    } else {
      response.send(
        movieArray.map((eachMovie) => convertSnakeToCamel(eachMovie))
      );
    }
  } catch (error) {
    console.error("Error fetching movie:", error.message);
    response.status(500).json({ error: "Error fetching movie" });
  }
});

app.get("/movies/", async (request, response) => {
  const getALlMoviesList = `
    SELECT movie_name FROM movie ORDER BY movie_id;
    `;
  const movieArray = await db.all(getALlMoviesList);
  response.send(movieArray.map((eachMovie) => convertSnakeToCamel(eachMovie)));
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMoviesList = `
    INSERT INTO movie (director_id, movie_name, lead_actor) VALUES (?, ?, ?);
  `;
  try {
    const result = await db.run(addMoviesList, [
      directorId,
      movieName,
      leadActor,
    ]);
    const movieId = result.lastID;
    response.status(201).json({ message: "Movie Successfully Added" });
  } catch (error) {
    console.error("Error adding movie:", error.message);
    response.status(500).json({ error: "Error adding movie" });
  }
});

module.exports = app;
