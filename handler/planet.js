'use strict';
const db = require('../db/dynamoDB')
const tableName = process.env.TABLE_PLANET;

const { getResponse } = require('../common/response');

module.exports.findAll = async (event, context, callBack) => {
  const message = 'Success';
  const data = await db.findAll(tableName);
  const response = await getResponse(200, { message, data })

  return response
};

module.exports.findOne = async (event, context, callBack) => {
  const item = await db.findOne(tableName, { ID: event.pathParameters.id });
  const message = item.Item ? 'Success' : `Planet with ID ${event.pathParameters.id} not exists`;
  const data = item.Item ? item.Item : { };
  const response = await getResponse(200, { message, data })

  return response
};

module.exports.createOne = async (event, context, callBack) => {
  const { body } = event, keys = Object.keys(body)
  let message = 'Planet Created', statusCode = 201
  let data = { }
  if(keys.length) {
    data = await db.createOne(tableName, JSON.parse(body));
  } else {
    message = 'Success and Planet not Created';
    statusCode = 200
  }
  const response = await getResponse(statusCode, { message, data })

  return response
};

module.exports.updateOne = async (event, context, callBack) => {
  const { body } = event, keys = Object.keys(body)
  let message = 'Planet Updated', statusCode = 201
  let data = { }
  if(keys.length) {
    data = await db.updateOne(tableName, JSON.parse(body), event.pathParameters.id);
  } else {
    message = 'Success and Planet not Updated';
    statusCode = 200
  }
  const response = await getResponse(statusCode, { message, data })

  return response
};

module.exports.deleteOne = async (event, context, callBack) => {
  const data = await db.deleteOne(tableName, event.pathParameters.id);
  const message = 'Success';
  const response = await getResponse(200, { message, data })

  return response
};
