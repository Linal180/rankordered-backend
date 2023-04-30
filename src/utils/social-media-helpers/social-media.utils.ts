import { google } from 'googleapis';

export const getGoogleUserInfo = async (accessToken: string) => {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const { data } = await google.oauth2({ version: 'v2', auth: oauth2Client }).userinfo.get();

  return data;
}
