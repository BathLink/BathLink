import { resetPassword } from 'aws-amplify/auth';
import { confirmResetPassword } from 'aws-amplify/auth';

export async function getForgotCode(username: string){
    const output = await resetPassword({
      username: username
    });

    const { nextStep } = output;
    switch (nextStep.resetPasswordStep) {
      case 'CONFIRM_RESET_PASSWORD_WITH_CODE':
        const codeDeliveryDetails = nextStep.codeDeliveryDetails;
        console.log(
          `Confirmation code was sent to ${codeDeliveryDetails.deliveryMedium}`
        );
        // Collect the confirmation code from the user and pass to confirmResetPassword.
        break;
      case 'DONE':
        console.log('Successfully reset password.');
        break;
    }
}


export async function confirmForgotCode(username: string, confirmationCode: string, newPassword: string){
    await confirmResetPassword({
      username: "hello@mycompany.com",  // The username of the user
      confirmationCode: "123456",      // The confirmation code received by the user
      newPassword: "hunter3",          // The new password the user wants to set
    });
}