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

        console.log("REST Operation:", restOperation);

        // Wait for the request to finish
        const response = await restOperation.response;

        if (!response) {
            throw new Error("No response received from API");
        }

        console.log("Full response:", response);

        const { body } = response;
        const jsonResponse = await body.json();

        console.log('POST call succeeded');
        console.log(jsonResponse);

        return jsonResponse; // Return the response if needed
    } catch (error) {
        console.error('POST call failed:', error);

    }
}
