import {signIn} from "@aws-amplify/auth";


export async function manualLogin(username: string, password: string){
    console.log("capybarra")
    try{
        const { nextStep: signInNextStep } = await signIn({
            username: username,
            password: password,
            options: {
                authFlowType: 'USER_PASSWORD_AUTH',
                preferredChallenge: 'PASSWORD_SRP'
            },
        });

        if (signInNextStep.signInStep === 'DONE') {
            console.log('Sign in successful!');
        }
    // Check for other values of signInNextStep.signInStep
    }
    catch(e){
        console.log(e)}

}