require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const POKEDEX = require('./pokedex.json')

const app = express()

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting))
app.use(helmet())
app.use(cors())

app.use(function validateBearerToken(req, res, next) {
  const authToken = req.get('Authorization')
  const apiToken = process.env.API_TOKEN
  
  if(!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' })
  }
  next()
}) //middleware function to run before each get

const baseUrl = 'http://localhost:8000'

const validTypes = [`Bug`, `Dark`, `Dragon`, `Electric`, `Fairy`, `Fighting`, `Fire`, `Flying`, `Ghost`, `Grass`, `Ground`, `Ice`, `Normal`, `Poison`, `Psychic`, `Rock`, `Steel`, `Water`]

function handleGetTypes(req, res) { //middleware function
  res.json(validTypes)
}

app.get('/types', handleGetTypes) //using middleware function, can have multiple middleware functions separated by ,

function handleGetPokemon(req, res) {
  const { name, type } = req.query
  let response = POKEDEX.pokemon

  if(name) {
    response = response.filter(pokemon => 
      pokemon.name.toLowerCase().includes(name.toLowerCase()))
  }

  if(type) {
    response = response.filter(pokemon =>
      pokemon.type.includes(type))    
  }
  
  res.json(response)  
}

app.get('/pokemon', handleGetPokemon)

//4 parameters in middleware, express knows to treat this as error handler
app.use((error, req, res, next) => {
  let response
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }}
  } else {
    response = { error }
  }
  res.status(500).json(response)
})

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})