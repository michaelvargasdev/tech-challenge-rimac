const AWS = require('aws-sdk');

const { getResponse } = require('../../common/response');
const lambda = require('../../handler/planet');

describe('Test createOnePlanet', () => {
    let putSpy;

    beforeAll(() => {
        putSpy = jest.spyOn(AWS.DynamoDB.DocumentClient.prototype, 'put');
    });

    afterAll(() => {
        putSpy.mockRestore();
    });

    it('Should create an item', async () => {
        putSpy.mockReturnValue({
            promise: () => Promise.resolve('data'),
        });

        const event = {
            body: '{ "ID": "id1", "nombre": "name1" }' ,
        };

        const result = await lambda.createOne(event);
        const message = 'Planet Created', statusCode = 201;
        const expectedResult =  await getResponse(statusCode, { message, data: { "ID": "id1", "nombre": "name1" } });

        expect(result).toEqual(expectedResult);
    });
});
