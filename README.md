# JuryRoom

## Documentation
- Structure of Data

    See [/imports/api/README.md](/imports/api/README.md)

- Meteor Methods API & Publications/Subscriptions

    See [/imports/api/API.md](/imports/api/API.md)

## Setup
 - ***Environment Variables***

    The following environment variables must be set to configure the respective services
    - MAIL_URL

        The mail service used for password reset/confirmation and notifications.
        > MAIL_URL="smtps://USERNAME:PASSWORD@HOST:PORT"
    - MONGO_URL

        The MongoDB service used for data storage
        > MONGO_URL="mongodb+srv://USERNAME:PASSWORD@HOST/DB_NAME"