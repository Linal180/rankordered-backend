import axios from 'axios';
import * as Twit from 'twit';
import { google } from 'googleapis';
import { InstagramUser, TwitterUser } from 'src/interfaces';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

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
        const clientEmail = process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL;
        const privateKey = process.env.GOOGLE_ANALYTICS_PRIVATE_KEY;

        console.log("********* getVisitAnalytics *********")
        let today = 0;
        let month = 0;

        if (!(propertyId && clientEmail && privateKey)) {
            console.log("******** GOOGLE ANALYTICS ENVS MISSING! *********")
            return { month, today };
        }
        console.log("********* calling GA API *********")

        const startDate = getDateXDaysAgo(30);
        const endDate = new Date().toISOString().split('T')[0];

        console.log(`******* ${propertyId} *******`)
        console.log("***********************************")
        const analyticsDataClient = new BetaAnalyticsDataClient({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey
            }
        });
        console.log("********** client is loaded ******")
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

        console.log("********************")
        console.log(response.rows)
        console.log("********************")
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
        console.log("2 ********************")
        console.log(todayResponse.rows)
        console.log("2 ********************")

        response.rows.forEach(row => {
            month = parseInt(row.metricValues[0].value) ?? 0
        });

        todayResponse.rows.forEach(row => {
            today = parseInt(row.metricValues[0].value) ?? 0
        });

        console.log(`********* ${response.rows} *********`)
        console.log(`********* ${todayResponse.rows} *********`)
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
