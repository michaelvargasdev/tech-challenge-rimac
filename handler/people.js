'use strict';
const axios = require('axios');

const { getResponse } = require('../common/response')

module.exports.findOne = async (event, context, callBack) => {
    const json = await axios.get(`https://swapi.py4e.com/api/people/${event.pathParameters.id}`)
    const { data } = json
    const message = 'Success';
    const response = await getResponse(200, { message, data })

    return response
};
