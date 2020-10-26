const AWS = require('aws-sdk');

const { getResponse } = require('../../common/response');
const lambda = require('../../handler/planet');

describe('Test findOnePlanet', () => {
    let getSpy;

    beforeAll(() => {
        getSpy = jest.spyOn(AWS.DynamoDB.DocumentClient.prototype, 'get');
    });

    afterAll(() => {
        getSpy.mockRestore();
    });

    it('Should get item by ID', async () => {
        const data = { ID: 'id1' };

        getSpy.mockReturnValue({
            promise: () => Promise.resolve({ Item: data }),
        });

        const event = {
            pathParameters: {
                id: 'id1',
            },
        };

        const result = await lambda.findOne(event);

        const message = 'Success';
        const expectedResult = await getResponse(200, { message, data })

        expect(result).toEqual(expectedResult);
    });
});
