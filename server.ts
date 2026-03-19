import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Social Media OAuth Endpoints
  app.get("/api/auth/:platform", (req, res) => {
    const { platform } = req.params;
    const redirectUri = `${process.env.APP_URL}/api/auth/${platform}/callback`;
    
    let authUrl = "";
    if (platform === "facebook") {
      const params = new URLSearchParams({
        client_id: process.env.FACEBOOK_CLIENT_ID!,
        redirect_uri: redirectUri,
        scope: "pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_metadata,pages_messaging,instagram_basic,instagram_content_publish,instagram_manage_comments,instagram_manage_messages",
        response_type: "code",
      });
      authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${params}`;
    } else if (platform === "tiktok") {
      const params = new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY!,
        redirect_uri: redirectUri,
        scope: "user.info.basic,video.list,video.upload,video.publish",
        response_type: "code",
      });
      authUrl = `https://www.tiktok.com/v2/auth/authorize/?${params}`;
    }

    if (authUrl) {
      res.redirect(authUrl);
    } else {
      res.status(400).send("Unsupported platform");
    }
  });

  app.get("/api/auth/:platform/callback", async (req, res) => {
    const { platform } = req.params;
    const { code } = req.query;
    const redirectUri = `${process.env.APP_URL}/api/auth/${platform}/callback`;

    try {
      let tokenData = {};
      if (platform === "facebook") {
        const response = await axios.get("https://graph.facebook.com/v18.0/oauth/access_token", {
          params: {
            client_id: process.env.FACEBOOK_CLIENT_ID,
            client_secret: process.env.FACEBOOK_CLIENT_SECRET,
            redirect_uri: redirectUri,
            code,
          },
        });
        tokenData = response.data;
      } else if (platform === "tiktok") {
        const response = await axios.post("https://open.tiktokapis.com/v2/oauth/token/", new URLSearchParams({
          client_key: process.env.TIKTOK_CLIENT_KEY!,
          client_secret: process.env.TIKTOK_CLIENT_SECRET!,
          code: code as string,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }).toString(), {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        tokenData = response.data;
      }

      // Send success message to parent window and close popup
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'SOCIAL_AUTH_SUCCESS', 
                  platform: '${platform}',
                  data: ${JSON.stringify(tokenData)}
                }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>تم تسجيل الدخول بنجاح. سيتم إغلاق هذه النافذة تلقائياً.</p>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("OAuth Error:", error.response?.data || error.message);
      res.status(500).send("Authentication failed");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
