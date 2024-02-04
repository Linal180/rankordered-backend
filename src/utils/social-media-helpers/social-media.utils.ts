import axios from 'axios';
import * as Twit from 'twit';
import { google } from 'googleapis';
import { InstagramUser, TwitterUser } from 'src/interfaces';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { PinterestAccessPayload } from '../../interfaces';

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


const instagramUserAPI = async (accessToken: string, userId: string): Promise<InstagramUser | null> => {
    const fields = 'id,username,name,profile_picture_url,account_type,media_count,followers_count,follows_count,biography';
    const apiUrl = `https://graph.instagram.com/v12.0/${userId}?fields=${fields}&access_token=${accessToken}`;

    try {
        const response = await axios.get(apiUrl);

        console.log("Instagram User *** ", response.data);
        return { ...response.data, email: `${response.data.username}@instagram,con` };
    } catch (error) {
        console.error('Error in InstagramUserAPI:', error);
        return null
    }
}

const pinterestUserAPI = async (accessToken: string): Promise<any> => {
    const apiUrl = `https://api.pinterest.com/v5/user_account`;
    console.log(":::::::::;")
    try {
        const response = await axios.get(apiUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                followRedirect: 'false'
            }
        });

        console.log("Pinterest User *** ", response.data);
        return { ...response.data, email: `${response.data.username}@instagram, con` };
    } catch (error) {
        console.error('Error in PinterestUserAPI:', error);
        return null
    }
}

const queryString = (data: { [key: string]: string }): string => {
    return Object.keys(data)
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
        .join('&');
}

export const getPinterestAccessToken = async (code: string): Promise<PinterestAccessPayload | null> => {
    const clientId = process.env.PINTEREST_CLIENT_ID
    const clientSecret = process.env.PINTEREST_CLIENT_SECRET

    try {
        const credentials = `${clientId}:${clientSecret}`;
        const base64Credentials = Buffer.from(credentials, 'utf-8').toString('base64');
        const tokenExchangeUrl = 'https://api.pinterest.com/v5/oauth/token';
        const redirectUri = 'http://localhost:4001'

        const data = {
            code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
        };

        const headers = {
            Authorization: `Basic ${base64Credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        };


        const response = await axios({
            method: 'POST',
            url: tokenExchangeUrl,
            data: queryString(data),
            headers
        })

        if (response) {
            const { data: { access_token } } = response
            console.log("****** ACCESS TOKEN *******", access_token)
            if (access_token) {
                const pinterestUser = await pinterestUserAPI(access_token)
                return pinterestUser;
            }
        }

        return null;
    } catch (error) {
        console.log("***** Error in getPinterestAccessToken *****")
        console.log(error.response)
        console.log("************************************")
        return null
    }
}

export const getInstagramAccessToken = async (code: string): Promise<InstagramUser | null> => {
    const form = new URLSearchParams();
    form.append('client_id', process.env.INSTAGRAM_CLIENT_ID);
    form.append('client_secret', process.env.INSTAGRAM_CLIENT_SECRET);
    form.append('grant_type', 'authorization_code');
    form.append('redirect_uri', process.env.INSTAGRAM_CALLBACK_URL);
    form.append('code', code);

    return await axios({
        method: 'POST',
        url: 'https://api.instagram.com/oauth/access_token',
        data: form,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    }).then(async (response) => {
        const { data: { access_token, user_id } } = response

        if (access_token && user_id) {
            const instagramUser = await instagramUserAPI(access_token, user_id)
            return instagramUser;
        }

        return null;
    }).catch((err) => {
        console.log(err.response);
        return null;
    });
}

export const getTwitterUserInfo = async (
    userAccessToken: string,
    userAccessSecret: string
): Promise<TwitterUser> => {
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

        return data as TwitterUser;
    } catch (error) {
        console.error('Error retrieving user information from Twitter:', error);
    }
};

const getDateXDaysAgo = (days: number) => {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - days);
    return currentDate.toISOString().split('T')[0];
};

export const getVisitAnalytics = async (): Promise<{ today: number; month: number }> => {
    try {
        const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
        let today = 0;
        let month = 0;

        if (!(propertyId)) {
            console.log("******** GOOGLE ANALYTICS ENVS MISSING! *********")
            return { month, today };
        }

        const startDate = getDateXDaysAgo(30);
        const endDate = new Date().toISOString().split('T')[0];

        const analyticsDataClient = new BetaAnalyticsDataClient();

        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [
                {
                    startDate,
                    endDate,
                }
            ],
            metrics: [
                {
                    name: 'screenPageViews'
                }
            ],
        });

        const [todayResponse] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [
                {
                    startDate: endDate,
                    endDate,
                }
            ],
            metrics: [
                {
                    name: 'screenPageViews'
                }
            ],
        });

        response.rows.forEach(row => {
            month = parseInt(row.metricValues[0].value) ?? 0
        });

        todayResponse.rows.forEach(row => {
            today = parseInt(row.metricValues[0].value) ?? 0
        });

        return { today, month };
    } catch (error) {
        console.log("*********** ERROR IN GOOGLE ANALYTICS API **********")
        console.log(error)
        console.log("************************************************")
        return { today: 0, month: 0 }
    }
}

export const generateSlug = (input: string) => {
    const sanitizedInput = input.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '');
    const slug = sanitizedInput.split(' ').join('-');
    return slug;
}
