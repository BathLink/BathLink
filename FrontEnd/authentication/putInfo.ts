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

        console.log("REST Operation:", restOperation);

        const { body } = await restOperation.response;

        console.log(body)

        const jsonResponse = await body.json();

        console.log('PUT call succeeded');
        console.log(jsonResponse);

        return jsonResponse; // Return the response if needed
    } catch (error) {
        console.error('PUT call failed:', error);

    }
}