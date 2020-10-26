const AWS = require('aws-sdk');

const { getResponse } = require('../../common/response');
const lambda = require('../../handler/planet');

describe('Test deleteOnePlanet', () => {
    let putSpy;

    beforeAll(() => {
        putSpy = jest.spyOn(AWS.DynamoDB.DocumentClient.prototype, 'delete');
    });

    afterAll(() => {
        putSpy.mockRestore();
    });

    it('Should delete an item', async () => {
        putSpy.mockReturnValue({
            promise: () => Promise.resolve('data'),
        });

        const event = {
            pathParameters: { id: 1 }
        };

        const result = await lambda.deleteOne(event);
        const message = 'Success', statusCode = 200;
        const expectedResult =  await getResponse(statusCode, { message, data: { ID: 1 } });

        expect(result).toEqual(expectedResult);
    });
});
