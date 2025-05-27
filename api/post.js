export default async function handler(req, res) {
  const TELEGRAM_TOKEN = process.env.BOT_TOKEN;
  const CHANNEL_ID = process.env.CHANNEL_ID; // e.g., "@yourchannel" or channel ID
  const apiUrl = "https://nsfw-noob-api.vercel.app/xnxx/15/desi";

  try {
    const response = await fetch(apiUrl);
    const json = await response.json();

    const data = json.data || [];

    if (!data.length) {
      return res.status(200).send("❌ No content found.");
    }

    for (const item of data) {
      const name = item.name || "No Title";
      const desc = item.description || "No Description";
      const date = item.upload_date || "Unknown Date";
      const thumbnail = item.thumbnail || "https://via.placeholder.com/300x200";
      const contentUrl = item.content_url || "#";

      // HTML caption
      const caption = `📌 <b>${escapeHTML(name)}</b>\n\n${escapeHTML(desc)}\n\n<b>আপলোড তারিখ:</b> ${escapeHTML(date)}`;

      const buttons = {
        inline_keyboard: [[{ text: "🎥 ভিডিও দেখুন", url: contentUrl }]]
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
    }

    return res.status(200).send("✅ সব কন্টেন্ট সফলভাবে পোস্ট করা হয়েছে");

  } catch (err) {
    return res.status(500).send("❌ Error: " + err.message);
  }
}

// Helper function to escape HTML characters for Telegram
function escapeHTML(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
