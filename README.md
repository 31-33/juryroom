# JuryRoom

## Setup
 - ***Environment Variables***

    The following environment variables must be set to configure the respective services
    - MAIL_URL

        The mail service used for password reset/confirmation and notifications.
        > MAIL_URL="smtps://USERNAME:PASSWORD@HOST:PORT"
    - MONGO_URL

        The MongoDB service used for data storage
        > MONGO_URL="mongodb+srv://USERNAME:PASSWORD@HOST/DB_NAME"