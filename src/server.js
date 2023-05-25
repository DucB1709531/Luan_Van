import express from 'express';
import configViewEngine from './config/viewEngine';
import initWebRoute from './route/web';
import initAPIRoute from './route/api';
// import connection from './config/connectDB';



require('dotenv').config();

const app = express()
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true })); //req.body (create new user)
app.use(express.json());

//setup view engine
configViewEngine(app);

//init webroute
initWebRoute(app);

//init API route
initAPIRoute(app);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})