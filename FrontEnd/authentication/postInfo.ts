import { post } from 'aws-amplify/api';


export async function postItem(path: string, data: any) {
    try {
        console.log(`Making POST request to: ${path}`);
        console.log("Data:", data);

        const restOperation = post({
            apiName: 'BathLinkAPI',
            path: path,
            options: { body: data }
        });

        const { body } = await restOperation.response;
        const jsonResponse = await body.json();

        return jsonResponse; // Return the response if needed
    } catch (error) {
        console.error('POST call failed:', error);

    }
}