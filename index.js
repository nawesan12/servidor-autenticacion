import express from "express"
import mysql from "mysql2"
import cors from "cors"
import dotenv from "dotenv"

const app = express()

// Middlewares
dotenv.config()
app.use(cors({ origin: "*" }))
app.use(express.json())

// Database Connection
const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  user: process.env.DATABASE_USER
})

// Routes
app.get("/usuarios", (req, res) => {

  db.query("SELECT * FROM usuarios", (err, datos) => {
    if(err) return res.status(500).send(err)

    res.status(200).json(datos)
  })

})

app.post("/registrar", (req, res) => {
  const { username, email, fullname, password, avatar } = req.body

  db.query("INSERT INTO usuarios (username, email, fullname, password, avatar) VALUES (?, ?, ?, ?, ?)",
    [username, email, fullname, password, avatar],
    (err, resultado) => {
      if(err) return res.status(500).send(err)

      res.status(201).json(resultado)
    }
  )
})

app.post("/iniciar-sesion", (req, res) => {
  const { identifier, password } = req.body

  const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g

  function passwordIsValid(passwordFromClient, passwordFromDB) {
    return passwordFromClient === passwordFromDB
  }

  if(emailRegex.test(identifier)) {
    
    db.query("SELECT * FROM usuarios WHERE email = ?",
      [identifier],
      (err, datos) => {
        if(err) return res.status(400).json(err)

        const usuario = {...datos[0]}

        if(passwordIsValid(password, usuario.password)) {
          res.status(200).json(usuario)
        } else {
          res.status(400).json({ messsage: "Contrasena incorrecta!" })
        }

      }
    )

  } else {
    
    db.query("SELECT * FROM usuarios WHERE username = ?",
      [identifier],
      (err, datos) => {
        if(err) return res.status(400).json(err)

        const usuario = {...datos[0]}

        if(passwordIsValid(password, usuario.password)) {
          res.status(200).json(usuario)
        } else {
          res.status(400).json({ messsage: "Contrasena incorrecta!" })
        }

        
      }
    )

  }



})

// Initialization
app.listen(3000, () => {
  console.log("Sistema de autenticacion levantado en puerto 3000")
})