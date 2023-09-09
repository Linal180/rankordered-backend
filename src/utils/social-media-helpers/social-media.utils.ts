import { google } from 'googleapis';
import * as Twit from 'twit';
import axios from 'axios';


export const getGoogleUserInfo = async (accessToken: string) => {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const { data } = await google
        .oauth2({ version: 'v2', auth: oauth2Client })
        .userinfo.get();

    return data;
};

export const getTiktokUserInfo = async (accessToken: string) => {
    try {
        // Send a request to TikTok's API to verify the access token
        const response = await axios.get(
            'https://api.tiktok.com/v2/user/',
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        // If the request is successful, return the TikTok user data
        return response.data.data;
    } catch (error) {
        // Handle any errors here (e.g., invalid access token)
        throw new Error('Access token verification failed');
    }
};

export const getTwitterUserInfo = async (
    userAccessToken: string,
    userAccessSecret: string
) => {
    try {
        const T = new Twit({
            consumer_key: process.env.TWITTER_CONSUMER_KEY,
            consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
            access_token: userAccessToken,
            access_token_secret: userAccessSecret
        });

        const { data } = await T.get('account/verify_credentials', {
            skip_status: true,
            include_email: true
        });

        return data;
    } catch (error) {
        console.error('Error retrieving user information from Twitter:', error);
    }
};
