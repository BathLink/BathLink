import { get } from 'aws-amplify/api'

export async function getInfo(path: string) {
    try {
        const restOperation = get({
            apiName: 'BathLinkAPI',
            path: path
        });
        const response = await restOperation.response;
        console.log('GET call succeeded: ', response);
        const responseBody = await response.body.json();
        return responseBody;
    } catch (error) {
        console.log('GET call failed: ', error);
    }
}
