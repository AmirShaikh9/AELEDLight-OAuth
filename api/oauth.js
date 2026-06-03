const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const TOKEN_URL = "https://github.com/login/oauth/access_token";

function serveHtml(res, html) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}

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

      const token = JSON.stringify(data.access_token);
      serveHtml(res, `<!DOCTYPE html>
<html><body><script>
(function(){
  var t = ${token};
  window.opener.postMessage("authorizing:github","*");
  function h(e){
    if(e.data==="authorizing:github"){
      window.removeEventListener("message",h);
      window.opener.postMessage(
        "authorization:github:success:"+JSON.stringify({token:t,provider:"github"}),
        e.origin
      );
      window.close();
    }
  }
  window.addEventListener("message",h);
  setTimeout(function(){
    try{window.opener.postMessage(
      "authorization:github:success:"+JSON.stringify({token:t,provider:"github"}),
      "*"
    );window.close()}catch(e){}
  },8000);
})();
<\/script></body></html>`);
    } catch (err) {
      return res.status(500).send(err.message);
    }
    return;
  }

  const redirectUri = "https://aeled-light-o-auth-1i1u.vercel.app/api/oauth";
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo&response_type=code`;
  res.redirect(authUrl);
};
