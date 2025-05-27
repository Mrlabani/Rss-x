const postedContent = new Set();

const API_LIST = [
  "https://nsfw-noob-api.vercel.app/xnxx/10/school",
  "https://nsfw-noob-api.vercel.app/xnxx/10/desi",
  "https://nsfw-noob-api.vercel.app/xnxx/10/college",
  "https://nsfw-noob-api.vercel.app/xnxx/10/bhabhi"
];

export default async function handler(req, res) {
  const TELEGRAM_TOKEN = process.env.BOT_TOKEN;
  const CHANNEL_ID = process.env.CHANNEL_ID;

  let totalPosts = 0;

  try {
    for (const apiUrl of API_LIST) {
      const response = await fetch(apiUrl);
      const json = await response.json();
      const data = json.data || [];

      if (!data.length) {
        // You can optionally log or ignore no content for this endpoint
        continue;
      }

      for (const item of data) {
        const contentUrl = item.content_url || "";
        if (!contentUrl || postedContent.has(contentUrl)) {
          continue; // Skip empty or duplicate content
        }

        postedContent.add(contentUrl);

        const name = item.name || "No Title";
        const desc = item.description || "No Description";
        const date = item.upload_date || "Unknown Date";
        const thumbnail = item.thumbnail || "https://via.placeholder.com/300x200";

        const caption = `📌 <b>${escapeHTML(name)}</b>\n\n${escapeHTML(desc)}\n\n<b>Upload Date:</b> ${escapeHTML(date)}`;
        const buttons = {
          inline_keyboard: [[{ text: "🎥 Watch Video", url: contentUrl }]]
        };

        const tgResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: CHANNEL_ID,
            photo: thumbnail,
            caption,
            parse_mode: "HTML",
            reply_markup: buttons
          })
        });

        const tgData = await tgResponse.json();

        if (!tgResponse.ok) {
          console.error("Telegram API error:", tgData);
          throw new Error(`Telegram Error: ${tgData.description}`);
        }

        totalPosts++;
      }
    }

    return res.status(200).send(`✅ ${totalPosts} new content(s) posted.`);

  } catch (err) {
    console.error(err);
    return res.status(500).send("❌ Error: " + err.message);
  }
}

function escapeHTML(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
