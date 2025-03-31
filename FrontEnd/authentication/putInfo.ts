import { put } from 'aws-amplify/api';

export async function putItem(path: string, data: any) {
    try {
        console.log(`Making PUT request to: ${path}`);
        console.log("Data being sent:", JSON.stringify(data, null, 2)); // Pretty-print for debugging

        const restOperation = put({
            apiName: 'BathLinkAPI',
            path: path,
            options: {
                headers: {
                    'Content-Type': 'application/json'
                },
                body: data // Ensure correct format
            }
        });

        console.log("REST Operation:", restOperation);

        const { body } = await restOperation.response;
        const jsonResponse = await body.json();

        console.log('PUT call succeeded');
        console.log('Response:', jsonResponse); // Log actual response

        return jsonResponse; // Return updated data
    } catch (error) {
        console.error('PUT call failed:', error);
        throw error; // Rethrow to catch errors in calling functions
    }
}
