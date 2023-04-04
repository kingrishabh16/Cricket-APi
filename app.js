const express = require("express");
const path = require("path");
const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
 SELECT
 *
 FROM
 cricket_team;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//api 2

app.post("/players/", async (request, response) => {
  const playerDetail = request.body;
  const { player_name, jersey_number, role } = playerDetail;
  const addPlayerQuery = `
    INSERT INTO
    cricket_team(player_name,
        jersey_number,
        role)
        VALUES
        (
            '${player_name}',
            ${jersey_number},
            '${role}'
        );`;
  await db.run(addPlayerQuery);

  response.send("Player Added to Team");
});

// api 3
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT *
    FROM
    cricket_team
    WHERE player_id=${playerId}
    `;
  let cricketTeam = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(cricketTeam));
});

//api 4

app.put("/players/:playerId/", async (request, response) => {
  const playerDetail = request.body;
  const { playerId } = request.params;
  const { player_name, jersey_number, role } = playerDetail;

  const updateQuery = `
    UPDATE 
    cricket_team
    SET
        player_name='${player_name}',
        jersey_number=${jersey_number},
        role='${role}'
    WHERE
    player_id=${playerId};
    `;
  await db.run(updateQuery);
  response.send("Player Details Updated");
});

//api 5
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `
    DELETE FROM
    cricket_team
    WHERE
    player_id=${playerId};
    `;
  await db.run(deletePlayer);
  response.send("Player Removed");
});

module.exports = app;
