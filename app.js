const express = require('express')
const fsPromises = require('fs').promises
const path = require('path')
const app = express()
const cors = require('cors')
const port = 3000
const errorServer = {
  status: 500,
  statusText: 'error',
  text: 'Error interno del servidor',
}

const CsbInspector = require('csb-inspector')
CsbInspector()
app.use(cors())
app.use(express.json())

//Ir al Home//
app.get('/', (req, res) => {
  try {
    return res.sendFile(path.resolve(__dirname + '/public/index.html'))
  } catch (e) {
    res
      .status(errorServer.status)
      .send({ status: errorServer.statusText, data: errorServer.text })
  }
})

app.listen(port, () => {
  console.log('El servidor esta activo en el puerto', port)
})

//Funcion valida campos y notas//
const validateInput = async (song) => {
  let result = ''
  if (
    song.id === '' ||
    song.titulo === '' ||
    song.artista === '' ||
    song.tono === ''
  ) {
    result = {
      status: 400,
      statusText: 'error',
      text: 'Info Server: No se han recibido todos los parametros',
    }
  } else if (
    song.tono !== 'Do' &&
    song.tono !== 'Re' &&
    song.tono !== 'Mi' &&
    song.tono !== 'Fa' &&
    song.tono !== 'Sol' &&
    song.tono !== 'La' &&
    song.tono !== 'Si'
  ) {
    result = {
      status: 400,
      statusText: 'error',
      text: 'Info Server: Tono ingresado no es valido',
    }
  } else
    result = {
      status: 200,
      statusText: 'ok',
      text: 'La información se ha procesado correctamente',
    }
  return result
}
//Funcion valida que canción no exista al agregar//
const validateSong = async (song) => {
  result = ''
  const loadInfo = JSON.parse(
    await fsPromises.readFile(__dirname + '/data/repertorio.json', 'utf8')
  )
  let listSongs = loadInfo.filter(
    (s) =>
      s.tono === song.tono &&
      s.titulo === song.titulo &&
      s.artista === song.artista
  )
  numSongs = listSongs.length
  if (numSongs !== 0) {
    result = {
      status: 400,
      statusText: 'error',
      text: 'Info Server: La canción ingresada ya existe',
    }
  }
  return result
}

//Funcion valida que el id a eliminar o modificar exista//

const validateId = async (song) => {
  result = ''
  const loadInfo = JSON.parse(
    await fsPromises.readFile(__dirname + '/data/repertorio.json', 'utf8')
  )

  let idModifi = loadInfo.filter((s) => s.id === song.id).length
  if (idModifi === 1) {
    result = {
      status: 400,
      statusText: 'error',
      text: 'Info Server: El id de la canción no existe',
    }
  }

  return result
}
//leer lista de songs//
app.get('/songs', async (req, res) => {
  try {
    const loadInfo = JSON.parse(
      await fsPromises.readFile(__dirname + '/data/repertorio.json', 'utf8')
    )
    return res.json(loadInfo)
  } catch (error) {
    res
      .status(errorServer.status)
      .send({ status: errorServer.statusText, data: errorServer.text })
  }
})
