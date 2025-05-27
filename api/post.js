const postedContent = new Set(); // Temporary in-memory store

export default async function handler(req, res) {
  const TELEGRAM_TOKEN = process.env.BOT_TOKEN;
  const CHANNEL_ID = process.env.CHANNEL_ID;
  const apiUrl = "https://nsfw-noob-api.vercel.app/xnxx/10/bhabi";

  try {
    const response = await fetch(apiUrl);
    const json = await response.json();
    const data = json.data || [];

    if (!data.length) {
      return res.status(200).send("❌ No content found.");
    }

    let postCount = 0;

    for (const item of data) {
      const contentUrl = item.content_url || "#";
      if (postedContent.has(contentUrl)) {
        continue; // Skip duplicate
      }

      postedContent.add(contentUrl); // Mark as posted

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
          caption: caption,
          parse_mode: "HTML",
          reply_markup: buttons
        })
      });

      const tgData = await tgResponse.json();

      if (!tgResponse.ok) {
        throw new Error(`Telegram Error: ${tgData.description}`);
      }

      postCount++;
    }

    return res.status(200).send(`✅ ${postCount} new content(s) posted.`);

  } catch (err) {
    return res.status(500).send("❌ Error: " + err.message);
  }
}

function escapeHTML(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
