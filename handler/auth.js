"use strict";
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const md5 = require('md5');
const db = require('../db/dynamoDB')
const tableName = process.env.TABLE_AUTH;

const { getResponse } = require('../common/response');

module.exports.authentication = async (event, context, callBack) => {
    let message = "Success", statusCode = 200, data = { token: null };
    try {
        const { body: bodyString } = event, body = JSON.parse(bodyString);
        const { userName, password } = body, passwordMd5 = md5(password);
        const keyConditionExpression = `userName = :userName and password = :password`
        const expressionAttributeValues = { ":userName": userName, ":password": passwordMd5 }//
        const items = await db.findMany(tableName, keyConditionExpression, expressionAttributeValues);
        const user = items.Items.length ? items.Items[0] : {};
        if(user.userName === body.userName && user.password === passwordMd5) {
            const cert = fs.readFileSync(path.join(__dirname, `../${process.env.JWT_SECRET}`));
            const payload = { ID: user.ID, userName: user.userName };
            const token = jwt.sign(payload, cert, { expiresIn: "5h" });
            data = { token }
        }
    } catch (error) {
        message = error.message;
        statusCode = 500;
        data = { error }
    }
    return await getResponse(statusCode, { message, data });
};

const generatePolicy = function (principalId, effect, resource) {
    let authResponse = {}
    authResponse.principalId = principalId
    if (effect && resource) {
        let policyDocument = {
            Version: '2012-10-17',
            Statement: []
        }
        let statementOne = {
            Action: 'execute-api:Invoke',
            Effect: effect,
            Resource: resource,
        }
        policyDocument.Statement[0] = statementOne
        authResponse.policyDocument = policyDocument
    }
    return authResponse
}

module.exports.authorization = async (event, context, callBack) => {
    let effect = 'Deny', userName = 'undefined';//Deny || Allow
    try {
        const cert = fs.readFileSync(path.join(__dirname, `../${process.env.JWT_SECRET}`));
        const authorization = event.authorizationToken;
        const authorizationArr = authorization.split(" ")

        if (authorizationArr.length === 2 && authorizationArr[0] === 'Bearer' && authorizationArr[1] !== undefined) {
            const token = authorizationArr[1];
            //const userName = req.headers.username || req.params.userName;
            const decodedJwt = jwt.verify(token, cert);
            if(decodedJwt) {
                if (decodedJwt.ID !== undefined && decodedJwt.userName !== undefined) {
                    const item = await db.findOne(tableName, { ID: decodedJwt.ID });
                    if (item.Item) {
                        if (decodedJwt.ID === item.Item.ID && decodedJwt.userName === item.Item.userName) {
                            effect = 'Allow';
                            userName = decodedJwt.userName;
                        }
                    }
                }
            }
        }
    } catch(error) {
        if (error.message !== 'invalid signature')
            throw error
    }

    return generatePolicy(userName, effect, '*');//event.methodArn
}
