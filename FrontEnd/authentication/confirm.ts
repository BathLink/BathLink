import {autoSignIn, confirmSignUp} from "@aws-amplify/auth";

//user will enter the confirmation code on a seperate page

export async function ConfirmEmailAddy(username: string, code: string){
    try{
        console.log("pets")
        const { nextStep: confirmSignUpNextStep } = await confirmSignUp({
            username: username,
            confirmationCode: code,
        });



        if (confirmSignUpNextStep.signUpStep === 'COMPLETE_AUTO_SIGN_IN') {
            // Call `autoSignIn` API to complete the flow
            const { nextStep } = await autoSignIn();

            if (nextStep.signInStep === 'DONE') {
                console.log('Successfully signed in.');
            }
        }
    }
catch (error: any) {
        console.log(error)
        throw new Error(error);
    }

}