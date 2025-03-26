import { get } from 'aws-amplify/api'


export async
    try {
        const restOperation = get({
            apiName: 'BathLinkAPI',
            path: 'users/' //replace with path of request
        });
        const response = await restOperation.response;
        console.log('GET call succeeded: ', response);
    } catch (error) {
        console.log('GET call failed: ', JSON.parse(error.response.body));
    }