import {Amplify} from "aws-amplify";
import {fetchAuthSession} from "@aws-amplify/auth";

Amplify.configure({
    Auth:{
      Cognito:{
          userPoolId: "eu-west-2_aImMz8Epi",
          userPoolClientId: "61dd7qvo7h4rl4kjd8q1d0vq4n",
          identityPoolId: "eu-west-2:1af75a6c-4e16-4b18-b554-e33de4602890"
      }
    },
    API: {
        REST: {
            BathLinkAPI: {
                endpoint: 'https://mdwq3r92te.execute-api.eu-west-2.amazonaws.com/prod/',
                region: 'eu-west-2',
            },
        },
    },

},
{
    API:{
        REST:{
            headers: async () => {
                const session = await fetchAuthSession();
                const token = session.tokens?.idToken;
                if(!token) throw new Error('No token found');
                return { Authorization: token.toString() };
            },
        }
    }
});