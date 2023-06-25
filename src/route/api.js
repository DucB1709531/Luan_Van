import express from "express";
import apiController from '../controller/apiController';
let router = express.Router();

const initAPIRoute = (app) => {
    router.post('/api/submit', apiController.handleRequest);
    return app.use('/api/v1/', router)
}

export default initAPIRoute;
