const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const TOKEN_URL = "https://github.com/login/oauth/access_token";

module.exports = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const code = url.searchParams.get("code");

  if (code) {
    try {
      const r = await fetch(TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code }),
      });
      const data = await r.json();
      if (!data.access_token) {
        return res.status(400).json(data);
      }
      return res.redirect(`https://aeledlight.web.app/admin/#access_token=${data.access_token}`);
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }

  const redirectUri = `https://aeled-light-o-auth-1i1u.vercel.app/api/oauth`;
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo&response_type=code`;
  res.redirect(authUrl);
};
