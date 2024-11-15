import { Options } from './sendMail';

export const getTemplate = (options: Options) => {
	const baseTemplate = (content: string) => `
   <div style="max-width:37.5em;margin:0 auto;font-family:Arial, sans-serif;background-color:#ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td style="padding:30px 20px;text-align:center;">
        <img alt="Leadlly" height="60" src="https://res.cloudinary.com/ytx/image/upload/v1731270603/Group_124_zru2yd.png" style="max-height: 60px;" />
      </td>
    </tr>
  </table>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td style="padding:0 20px;text-align:center;"> ${content} </td>
    </tr>
  </table>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #e0e0e0;">
    <tr>
      <td style="padding:30px 40px;text-align:center;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="text-align:left;padding-bottom:15px;width:66%">
              <img alt="Leadlly" height="36" src="https://res.cloudinary.com/ytx/image/upload/v1731270603/Group_124_zru2yd.png" width="120" />
            </td>
            <td style="text-align:right;padding-bottom:15px;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%">
                <tr>
                  <td style="padding-right:10px;">
                    <a href="https://x.com/leadlly_ed" target="_blank">
                      <img alt="Twitter" height="32" src="https://res.cloudinary.com/ytx/image/upload/v1731407923/twitter-x_ft91uu.png" width="32" />
                    </a>
                  </td>
                  <td style="padding-right:10px;">
                    <a href="https://www.instagram.com/leadlly.in" target="_blank">
                      <img alt="Instagram" height="32" src="https://res.cloudinary.com/ytx/image/upload/v1731407923/instagram_1_z0cos7.png" width="32" />
                    </a>
                  </td>
                  <td>
                    <a href="https://www.linkedin.com/company/leadlly-edu/" target="_blank">
                      <img alt="LinkedIn" height="32" src="https://res.cloudinary.com/ytx/image/upload/v1731407923/linkdin_igumjq.png" width="32" />
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="font-size:12px;color:#b7b7b7;text-align:center;padding-top:15px;padding-bottom:15px;">
              <a href="https://www.leadlly.in/terms-and-conditions" style="color:#b7b7b7;text-decoration:underline;" target="_blank">Terms & Conditions</a> | <a href="https://www.leadlly.in/privacy-policy" style="color:#b7b7b7;text-decoration:underline;" target="_blank">Privacy Policy</a> | <a href="https://play.google.com/store/apps/details?id=com.leadlly.app" style="color:#b7b7b7;text-decoration:underline;" target="_blank">Download the App</a>
              <p style="margin-top:20px;">©2022 Leadlly Edusolutions Pvt. Ltd. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</div>

  `;

	// Now insert the specific content depending on the tag
	switch (options.tag) {
		case 'otp':
			return baseTemplate(`
       
        <h1 style="font-size:28px;font-weight:700;margin:30px 0;color:#333;">Confirm Your Email Address</h1>
    <p style="font-size:18px;margin-bottom:30px;color:#555;">Please use the code below to complete your registration for Leadlly.</p>
    
  
    <div style="background-color:#f5f4f5; border-radius:8px; padding:25px; text-align:center; max-width:300px; margin:auto; margin-bottom:30px;">
      <p style="font-size:24px;margin:0;font-weight:bold;color:#333;">${options.message}</p>
    </div>
    
    <p style="font-size:14px;margin:30px 0;color:#555;">If you don't want to create an account, you can ignore this email.</p>
      `);

		case 'password_reset':
			return baseTemplate(`
        <h1 style="font-size:28px;font-weight:700;margin:30px 0;color:#333;">Password Reset Request</h1>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <a href="${options.message}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #9652f4; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you did not request a password reset, please ignore this email.</p>
      `);

		case 'subscription_active':
			return baseTemplate(`
         <table style="max-width: 660px; margin: 0 auto; padding: 20px 0 48px; width: 100%; font-family: Arial, sans-serif; color: #333;">
  <tr>
    <td style="text-align: center;">
      <h1 style="font-size:28px; font-weight:700; margin:30px 0; color:#333;">Thanks for your order</h1>
    </td>
  </tr>

  <tr>
    <td style="text-align: center; margin: 36px 0 40px;">
      <p style="font-size: 16px; line-height: 24px; font-weight: 500; color: #111111;">
        Your payment has been successfully processed. Below are the details of your transaction.
      </p>
    </td>
  </tr>

  <tr>
    <td style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; font-size: 14px; color: #333;">
      <table style="width: 100%; border-spacing: 0;">
        <tr>
          <td style="width: 48%; padding-right: 10px; vertical-align: top;">
            <p style="font-size: 12px; color: #777; margin: 0;">Payment ID</p>
            <p style="font-size: 14px; margin: 5px 0;">${options.razorpayId}</p>
          </td>
          <td style="width: 48%; padding-left: 10px; vertical-align: top;">
            <p style="font-size: 12px; color: #777; margin: 0;">Invoice Date</p>
            <p style="font-size: 14px; margin: 5px 0;">${options.dateOfActivation}</p>
          </td>
        </tr>

        <tr>
          <td style="width: 48%; padding-right: 10px; vertical-align: top;">
            <p style="font-size: 12px; color: #777; margin: 0;">Order ID</p>
            <a href="https://example.com/order-details/${options.planId}" style="color: #067df7; text-decoration: none; font-size: 14px;">${options.planId}</a>
          </td>
          <td style="width: 48%; padding-left: 10px; vertical-align: top;">
            <p style="font-size: 12px; color: #777; margin: 0;">Billed To</p>
            <p style="font-size: 14px; margin: 5px 0;">${options.username}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <tr >
    <td style="padding: 20px 0; border-radius: 8px;">
      <table style="width: 100%; border-spacing: 0;">
        <tr>
          <td>
            <p style="font-size: 14px; font-weight: 600; margin: 0;">${options.planName}</p>
            <p style="font-size: 14px; color: #777; margin: 0;">${options.duration} months</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 14px; font-weight: 600; margin: 0;">₹${options.price}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td style="width: 100%;  text-align: right; border-top: 1px solid #e0e0e0; border-bottom: 1px solid #e0e0e0;">
      <table style="width: 100%; border-spacing: 0;">
        <tr>
          <td style="text-align: right; padding-right: 20px;width:70%">
            <p style="font-size: 12px; font-weight: 600; color: #777; margin: 0;">TOTAL</p>
          </td>
          <td style="border-left: 1px solid #e0e0e0; height: 48px;"></td>
          <td style="text-align: right; padding-left: 20px;">
            <p style="font-size: 16px; font-weight: 600; margin: 0;">₹${options.price}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td style="margin-top: 30px; text-align: center;">
      <p style="font-size: 14px; line-height: 24px; font-weight: 500; color: #111111;">
        Enjoy your subscription and the benefits it brings! You can manage your subscription at any time from your 
        <a href="${options.dashboardLink}" style="display: block; margin: 20px; padding: 12px 24px; font-size: 14px; color: #fff; background-color: #067df7; text-decoration: none; border-radius: 5px; font-weight: 600; text-align: center;" target="_blank">
          Dashboard
        </a>.
      </p>
    </td>
  </tr>

  <tr>
    <td style="text-align: center;">
      <p style="font-size: 14px; line-height: 24px; font-weight: 500; color: #111111;">
        If you have any questions, feel free to <a href="mailto:support@leadlly.in" style="color: #9652f4; text-decoration: none;">contact us</a>.
      </p>
      <p style="font-size: 14px; line-height: 24px; font-weight: 500; color: #111111;">
        Thank you for choosing our service!
      </p>
    </td>
  </tr>
</table>


      `);
		case 'free_trial_active':
			return baseTemplate(`
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px 0; background-color: #ffffff;">
  
  <h2 style="color: #9652f4; font-size: 24px; margin-bottom: 20px;">${options.message} Activated!</h2>
  
  <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Dear ${options.username},</p>
  
  <p style="font-size: 16px; color: #555; margin-bottom: 30px;">Your subscription is now active. Enjoy all the benefits of our service.</p>
  
  <a href="${options.dashboardLink}" 
     style="display: inline-block; padding: 12px 25px; font-size: 16px; color: white; background-color: #9652f4; text-decoration: none; border-radius: 5px; margin-top: 20px;">
     Go to Dashboard
  </a>
  
  <p style="font-size: 14px; color: #555; margin-top: 30px;">
    If you have any questions, feel free to <a href="mailto:support@leadlly.in" style="color: #9652f4;">contact us</a>.
  </p>
  
  <p style="font-size: 16px; color: #333; margin-top: 30px;">Thank you for choosing our service!</p>

</div>

      `);

		default:
			return baseTemplate(options.message);
	}
};
