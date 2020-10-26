const AWS = require('aws-sdk');

const { getResponse } = require('../../common/response');
const lambda = require('../../handler/planet');

describe('Test findAllPlanets', () => {
    let scanSpy;

    beforeAll(() => {
        scanSpy = jest.spyOn(AWS.DynamoDB.DocumentClient.prototype, 'scan');
    });

    afterAll(() => {
        scanSpy.mockRestore();
    });

    it('Should return IDs', async () => {
        const data = [{ ID: 'id1' }, { ID: 'id2' }];

        scanSpy.mockReturnValue({
            promise: () => Promise.resolve({ Items: data }),
        });

        const event = { };

        const result = await lambda.findAll(event);
        const message = 'Success';
        const expectedResult = await getResponse(200, { message, data })

        expect(result).toEqual(expectedResult);
    });
});
