export default async function handler(req, res) {
  const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const SITE_URL = process.env.SITE_URL || `https://${process.env.VERCEL_URL}`;
  const redirectUri = `${SITE_URL}/api/auth/callback`;

  const url = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo&response_type=code`;
  res.redirect(url);
}
