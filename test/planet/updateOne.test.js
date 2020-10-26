const AWS = require('aws-sdk');

const { getResponse } = require('../../common/response');
const lambda = require('../../handler/planet');

describe('Test updateOnePlanet', () => {
    let putSpy;

    beforeAll(() => {
        putSpy = jest.spyOn(AWS.DynamoDB.DocumentClient.prototype, 'update');
    });

    afterAll(() => {
        putSpy.mockRestore();
    });

    it('Should update an item', async () => {
        putSpy.mockReturnValue({
            promise: () => Promise.resolve('data'),
        });

        const event = {
            body: '{ "nombre": "name1" }' ,
            pathParameters: { id: 1 }
        };

        const result = await lambda.updateOne(event);
        const message = 'Planet Updated', statusCode = 201;
        const expectedResult =  await getResponse(statusCode, { message, data: { ID: 1, "nombre": "name1" } });

        expect(result).toEqual(expectedResult);
    });
});
