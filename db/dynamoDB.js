const { uuid } = require('uuidv4');
const AWS = require('aws-sdk');

const documentClient = new AWS.DynamoDB.DocumentClient();

module.exports.findOne = async (TableName, Key) => {
    const params = { TableName, Key };
    const item = await documentClient.get(params).promise();
    return item
}

module.exports.findMany = async (TableName, KeyConditionExpression, ExpressionAttributeValues) => {
    const params = { TableName, IndexName: 'userName-index', KeyConditionExpression, ExpressionAttributeValues };
    const item = await documentClient.query(params).promise();
    return item
}

module.exports.findAll = async (TableName) => {
    const params = { TableName };
    let { Items } = await documentClient.scan(params).promise();
    return Items
}

module.exports.createOne = async (TableName, Item) => {
    Item.ID = Item.ID ? Item.ID : uuid()
    const params = { TableName, Item };
    const rest = await documentClient.put(params).promise();
    if (!rest)
        throw Error(`There was an error inserting element in table ${TableName}`)

    return Item
}

module.exports.updateOne = async (TableName, data, ID) => {
    const setUpdate = Object.keys(data).map(key => `${key} = :${key}Update`).join(', ')
    const uex = `set ${setUpdate}`
    const map = new Map(Object.keys(data).map(key => [`:${key}Update`, data[key]]))
    const eav = Object.fromEntries(map)
    const params = {
        TableName,
        Key: { ID },
        //UpdateExpression: `set lastName = :updateValue`,
        //ExpressionAttributeValues: { ':updateValue': data.lastName }
        UpdateExpression: uex,
        ExpressionAttributeValues: eav
    };
    const rest = await documentClient.update(params).promise();

    return { ID, ...data }
}

module.exports.deleteOne = async (TableName, ID) => {
    const params = { TableName, Key: { ID } };
    const rest = await documentClient.delete(params).promise();
    return { ID }
}

module.exports.createMany = async (TableName, data) => {
    const params = {
        RequestItems: {
            [TableName]: data.map(item => {
                return { PutRequest: { Item: { "ID": uuid(), ...item } } }
            })
        }
    }

    const rest = await documentClient.batchWrite(params).promise();

    return rest
}
