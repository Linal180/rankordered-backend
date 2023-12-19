/**
 * @see https://dev.twitter.com/overview/api/users
 */
export interface TwitterUser {
  id: number,
  id_str: string,
  name: string,
  screen_name: string,
  profile_image_url: string,
  profile_image_url_https: string,
  email: string
}

export interface SsoUser {
  email: string,
  name: string,
  picture: string,
  username: string,
}

export interface GoogleUser {
  id: string,
  email: string,
  name: string,
  given_name: string,
  family_name: string,
  picture: string,
}
