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
app.use(cors())
app.use(express.json())
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
      s.tono.toUpperCase() === song.tono.toUpperCase() &&
      s.titulo.toUpperCase() === song.titulo.toUpperCase() &&
      s.artista.toUpperCase() === song.artista.toUpperCase()
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
//Funcion valida que canción no exista al Modificar//
const validateModifi = async (song) => {
  result = ''
  const loadInfo = JSON.parse(
    await fsPromises.readFile(__dirname + '/data/repertorio.json', 'utf8')
  )
  let listSongs = loadInfo.filter(
    (s) =>
      s.id !== song.id &&
      s.tono.toUpperCase() === song.tono.toUpperCase() &&
      s.titulo.toUpperCase() === song.titulo.toUpperCase() &&
      s.artista.toUpperCase() === song.artista.toUpperCase()
  )
  if (listSongs.length > 0) {
    result = {
      status: 400,
      statusText: 'error',
      text: 'Info Server: La canción al ser modificada agregaria una cancion ya existente',
    }
  }
  return result
}
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
//agregar songs//
app.post('/songs', async (req, res) => {
  try {
    const song = req.body
    const resp = await validateInput(song)

    const respSong = await validateSong(song)
    if (respSong.status === 400) {
      res.status(respSong.status).send({
        status: respSong.statusText,
        data: respSong.text,
      })
      return
    }
    if (resp.status === 200) {
      const songs = JSON.parse(
        await fsPromises.readFile(__dirname + '/data/repertorio.json', 'utf8')
      )
      songs.push(song)
      await fsPromises.writeFile(
        path.resolve(__dirname + '/data/repertorio.json'),
        JSON.stringify(songs)
      )
    }
    res.status(resp.status).send({
      status: resp.statusText,
      data: resp.text,
    })
  } catch (error) {
    res
      .status(errorServer.status)
      .send({ status: errorServer.statusText, data: errorServer.text })
  }
})
//eliminar song/
app.delete('/songs/:id', async (req, res) => {
  try {
    const { id } = req.params
    const respId = await validateId(id)
    if (respId.status === 400) {
      res.status(respId.status).send({
        status: respId.statusText,
        data: respId.text,
      })
      return
    }
    if (id !== '') {
      const songs = JSON.parse(
        await fsPromises.readFile(
          path.resolve(__dirname + '/data/repertorio.json')
        )
      )
      const index = songs.findIndex((p) => p.id == id)
      songs.splice(index, 1)
      await fsPromises.writeFile(
        path.resolve(__dirname + '/data/repertorio.json'),
        JSON.stringify(songs)
      )
      return res.send('Canción eliminada con éxito')
    } else {
      res.status(400).send({ status: 'ok', data: 'No se ha recibido el id' })
    }
  } catch (error) {
    res
      .status(errorServer.status)
      .send({ status: errorServer.statusText, data: errorServer.text })
  }
})
//modificar song/
app.put('/songs/:id', async (req, res) => {
  try {
    const { id } = req.params
    const song = req.body
    const resp = await validateInput(song)
    const respId = await validateId(id)

    const respmodifi = await validateModifi(song)
    if (respmodifi.status === 400) {
      res.status(respmodifi.status).send({
        status: respmodifi.statusText,
        data: respmodifi.text,
      })
      return
    }

    if (respId.status === 400) {
      res.status(respId.status).send({
        status: respId.statusText,
        data: respId.text,
      })
      return
    }
    if (resp.status === 200) {
      const songs = JSON.parse(
        await fsPromises.readFile(
          path.resolve(__dirname + '/data/repertorio.json')
        )
      )
      const index = songs.findIndex((p) => p.id == id)
      songs[index] = song
      await fsPromises.writeFile(
        path.resolve(__dirname + '/data/repertorio.json'),
        JSON.stringify(songs)
      )
      res.status(resp.status).send({
        status: resp.statusText,
        data: resp.text,
      })
    }
  } catch (error) {
    res
      .status(errorServer.status)
      .send({ status: errorServer.statusText, data: errorServer.text })
  }
})
