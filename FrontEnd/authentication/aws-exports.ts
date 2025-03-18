import {Amplify} from "aws-amplify";
import {fetchAuthSession} from "@aws-amplify/auth";

Amplify.configure({
    Auth:{
      Cognito:{
          userPoolId: "eu-west-2_rmKGv9RRx",
          userPoolClientId: "5749fbmbs7u5plqcs45itie053"
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
},{
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