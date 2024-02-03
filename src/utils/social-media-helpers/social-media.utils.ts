import axios from 'axios';
import * as Twit from 'twit';
import { google } from 'googleapis';
import { TwitterUser } from 'src/interfaces';
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

export const getVisitAnalytics = async () => {
    try {
        const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
        const cleintEmail = process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL;
        const privateKey = process.env.GOOGLE_ANALYTICS_PRIVATE_KEY;

        let analysisReport = {
            today: 0,
            month: 0
        }

        if (!(propertyId && cleintEmail && privateKey)) {
            console.log("******** GOOGLE ANALYTICS ENVS MISSING! *********")
            return analysisReport;
        }

        const startDate = getDateXDaysAgo(30);
        const endDate = new Date().toISOString().split('T')[0];

        const analyticsDataClient = new BetaAnalyticsDataClient({
            credentials: {
                client_email: cleintEmail,
                private_key: privateKey
            }
        });

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
            analysisReport.month = parseInt(row.metricValues[0].value) ?? 0
        });

        todayResponse.rows.forEach(row => {
            analysisReport.today = parseInt(row.metricValues[0].value) ?? 0
        });

        return analysisReport;
    } catch (error) {
        console.log(error)
    }
}
