import { del } from 'aws-amplify/api';


export async function deleteItem(path: string, data: any) {
    try {
        console.log(`Making PUT request to: ${path}`);
        console.log("Data:", data);

        const restOperation = del({
            apiName: 'BathLinkAPI',
            path: path,
            options: {
                headers: {
                    'Content-Type': 'application/json'
                },
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