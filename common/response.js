module.exports.getResponse = async (statusCode, body) => ({ statusCode, body: JSON.stringify(body , null, 2) })