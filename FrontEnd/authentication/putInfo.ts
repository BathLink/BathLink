import { put } from 'aws-amplify/api';


export async function putItem(path: string, data: any) {
    try {
        console.log(`Making PUT request to: ${path}`);
        console.log("Data:", data);

        const restOperation = put({
            apiName: 'BathLinkAPI',
            path: path,
            options: {
    headers: {
        'Content-Type': 'application/json' // Specify the content type
    },
    body: (data)
            }
        });

        const { body } = await restOperation.response;


        const jsonResponse = await body.json();

        return jsonResponse; // Return the response if needed
    } catch (error) {
        console.error('PUT call failed:', error);

    }
}