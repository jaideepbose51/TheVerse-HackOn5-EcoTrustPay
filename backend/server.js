import express from "express"
import 'dotenv/config'

// App Config
const app = express()
const port = process.env.PORT 

app.get("/", (req,res) => {
    res.send("API WORKING")
})

app.listen(port, () => {
    console.log("Server Running on ",port)
})