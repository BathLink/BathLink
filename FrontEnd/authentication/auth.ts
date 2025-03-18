import {signUp} from "@aws-amplify/auth";
import './aws-exports' //Change to whatever the path of the file is


async function SignUp(username,password, email, firstName, lastName, phone, dob){
    console.log("apples")
    const { nextStep: signUpNextStep } = await signUp({
        username: username,  //ensure it is a bath email
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
