import {signUp} from "@aws-amplify/auth";
import './aws-exports'; //Change to whatever the path of the file is


export async function SignUp(username: string,password: string, email: string, firstName: string, lastName: string, phone: string, dob: string){
    console.log("apples");
    try{
        const { nextStep: signUpNextStep } = await signUp({
            username: email,  //ensure it is a bath email
            password: password,
            options: {
                userAttributes: {
                    email: email,
                    phone_number: phone,
                    birthdate: dob,
                    given_name: firstName,
                    family_name: lastName,

                },
                autoSignIn: {
                    authFlowType: 'USER_PASSWORD_AUTH',
                    preferredChallenge: 'PASSWORD_SRP'
                },


            },

        });

        console.log(signUpNextStep)

    }
    catch(e){
        console.log(e)
    }



}
