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
