const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const TOKEN_URL = "https://github.com/login/oauth/access_token";

module.exports = async (req, res) => {
  const url = new URL(req.url, "http://" + req.headers.host);
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
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(data));
      }
      res.writeHead(302, { Location: "https://aeledlight.web.app/admin/callback.html#access_token=" + data.access_token });
      res.end();
    } catch (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end(err.message);
    }
    return;
  }

  var authUrl = "https://github.com/login/oauth/authorize?client_id=" + CLIENT_ID + "&redirect_uri=" + encodeURIComponent("https://aeled-light-o-auth-1i1u.vercel.app/api/oauth") + "&scope=repo&response_type=code";
  res.writeHead(302, { Location: authUrl });
  res.end();
};
