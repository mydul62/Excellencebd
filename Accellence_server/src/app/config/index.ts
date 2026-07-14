import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
    env:process.env.NODE_ENV,
    port:process.env.PORT,
    cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
    cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
    jwt:{
        jwt_scret:process.env.JWT_SECRET,
        expires_in:process.env.EXPIRES_IN,
        refresh_token_secret:process.env.REFRESH_TOEKN_SECRET,
        refresh_token_expires_in:process.env.REFRESH_TOEKN_EXPIRES_IN,
    },
    reset_password_secret:process.env.RESET_PASS_TOKEN,
    reset_password_expires_in:process.env.RESET_PASS_TOKEN_EXPIRES_IN,
    reset_password_link:process.env.RESET_PASSWORD_LINK,
    email:process.env.EMAIL,
    app_password:process.env.APP_PASSWORD,
    ssl:{
        storeId:process.env.STORE_ID,
        storePass:process.env.STORE_PASS,
        successUrl:process.env.PAYMENT_SUCCESS_URL,
        cancelUrl:process.env.PAYMENT_CANCEL_URL,
        failUrl:process.env.PAYMENT_FAILD_URL,
        sslPaymentApi:process.env.SSL_PAYMENT_API,
        sslValidationApi:process.env.SSL_VALIDATION_API,
        sslverifyUrl:process.env.SSL_PAYMENT_VERIFY_URL
    },
  email_pass: process.env.EMAIL_PASS!,
  email_user: process.env.EMAIL_USER!,
  owner_email: process.env.OWNER_EMAIL,
};
