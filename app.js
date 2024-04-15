const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()

app.use(express.json())
const dbpath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeBDAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => console.log('Server is Running'))
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayersList = `
    SELECT *
    FROM
    crickrt_team;`
  const playersList = await db.all(getPlayersList)
  response.send(
    playersList.map(eachObject => convertDbObjectToResponseObject(eachObject)),
  )
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayer = `
    SELECT *
    FROM 
    cricket_team
    WHERE player_id = ${playerId};`
  const player = await db.get(getPlayer)
  response.send(convertDbObjectToResponseObject(player))
})

app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const postPlayerQuery = `
    INSERT INTO
    cricket_team (player_name, jersey_number, role)
    VALUES('${playerName}', ${jerseyNumber}, '${role}');`
  const player = await db.run(postPlayerQuery)
  response.send('Player Added to Team')
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName, jerseyNumber, role} = request.body
  const updatedQuery = `
    UPDATE 
    cricket_team 
    SET 
    player_name ="${playerName}",
    jersey_number = ${jerseyNumber},
    role = "${role}"
    WHERE player_id = ${playerId};`
  await db.run(updatedQuery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletedQuery = `
    DELETE FROM
    cricket_team
    WHERE
    player_id = ${playerId};`
  await db.run(deletedQuery)
  response.send('Player Removed')
})

module.exports = app
