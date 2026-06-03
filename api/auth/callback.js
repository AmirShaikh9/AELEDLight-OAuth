export default async function handler(req, res) {
  const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
  const TOKEN_URL = "https://github.com/login/oauth/access_token";

  const { code } = req.query;
  if (!code) {
    res.status(400).send("Missing code");
    return;
  }

  try {
    const r = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      }),
    });

    const data = await r.json();
    if (!data.access_token) {
      return res.status(400).json(data);
    }

    res.redirect(`https://aeledlight.web.app/admin/#access_token=${data.access_token}`);
  } catch (err) {
    res.status(500).send(err.message);
  }
}
