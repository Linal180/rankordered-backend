import { google } from 'googleapis';
import { Exception } from 'handlebars';
import * as Twit from 'twit';

export const getGoogleUserInfo = async (accessToken: string) => {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const { data } = await google.oauth2({ version: 'v2', auth: oauth2Client }).userinfo.get();

  return data;
}

export const getTwitterUserInfo = async (userAccessToken: string, userAccessSecret: string) => {
  try {
    const T = new Twit({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token: userAccessToken,
      access_token_secret: userAccessSecret,
    });

    if (!process.env.TWITTER_CONSUMER_KEY || !process.env.TWITTER_CONSUMER_SECRET) {
      throw new Exception('Twitter Env missing!')
    }

    const { data } = await T.get('account/verify_credentials', { skip_status: true, include_email: true });

    return data;
  } catch (error) {
    console.error('Error retrieving user information from Twitter:', error);
  }
};