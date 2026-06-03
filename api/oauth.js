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

      var token = JSON.stringify(data.access_token);
      var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Auth</title></head><body>';
      html += '<p id="m">Authenticating...</p>';
      html += '<script>var m=document.getElementById("m");var t=' + token + ';';
      html += 'try{';
      html += 'm.textContent="Sending handshake...";';
      html += 'window.opener.postMessage("authorizing:github","*");';
      html += 'm.textContent="Waiting for reply...";';
      html += 'function h(e){if(e.data==="authorizing:github"){';
      html += 'window.removeEventListener("message",h);';
      html += 'm.textContent="Sending token...";';
      html += 'window.opener.postMessage("authorization:github:success:"+JSON.stringify({token:t,provider:"github"}),e.origin);';
      html += 'm.textContent="Done! Closing...";';
      html += 'setTimeout(function(){window.close()},300);';
      html += '}}';
      html += 'window.addEventListener("message",h);';
      html += 'setTimeout(function(){try{';
      html += 'window.opener.postMessage("authorization:github:success:"+JSON.stringify({token:t,provider:"github"}),"*");';
      html += 'm.textContent="Token sent, closing...";';
      html += 'setTimeout(function(){window.close()},500);';
      html += '}catch(e){m.textContent="Error: "+e.message}}';
      html += ',5000);';
      html += '}catch(e){m.textContent="Error: "+e.message}';
      html += '<\/script></body></html>';

      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end(err.message);
    }
    return;
  }

  var redirectUri = "https://aeled-light-o-auth-1i1u.vercel.app/api/oauth";
  var authUrl = "https://github.com/login/oauth/authorize?client_id=" + encodeURIComponent(CLIENT_ID) + "&redirect_uri=" + encodeURIComponent(redirectUri) + "&scope=repo&response_type=code";
  res.redirect(authUrl);
};
