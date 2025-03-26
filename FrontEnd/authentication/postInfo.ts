import { post } from 'aws-amplify/api';

export async function postItem() {
    try {
        const restOperation = post({
            apiName: 'myRestApi',
            path: 'items',
            options: {
                body: {
                    message: 'Mow the lawn'
                }
            }
        });

        const { body } = await restOperation.response;
        const response = await body.json();

        console.log('POST call succeeded');
        console.log(response);
    } catch (error) {
        console.log('POST call failed: ', JSON.parse(error.response.body));
    }
}