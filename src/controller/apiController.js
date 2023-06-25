const axios = require('axios');

let handleRequest = async (req, res) => {
    try {
        // Get the user request data from the request body
        const { message } = req.body;

        // Make a request to the Rasa server's REST API
        const response = await axios.post('http://localhost:5005/webhooks/rest/webhook', {
            message: message,
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Process the response from Rasa
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error occurred while communicating with Rasa server');
    }
};

module.exports = {
    handleRequest: handleRequest,
};
