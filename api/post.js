export default async function handler(req, res) {
  const TELEGRAM_TOKEN = process.env.BOT_TOKEN;
  const CHANNEL_ID = process.env.CHANNEL_ID; // e.g. "@yourchannel"

  const apiUrl = "https://nsfw-noob-api.vercel.app/xnxx/10/desi";

  try {
    const response = await fetch(apiUrl);
    const json = await response.json();

    const data = json.data || [];

    if (!data.length) {
      return res.status(200).send("No content found.");
    }

    for (const item of data) {
      const name = item.name || "No Title";
      const desc = item.description || "No Description";
      const date = item.upload_date || "Unknown Date";
      const thumbnail = item.thumbnail || "https://via.placeholder.com/300x200";
      const contentUrl = item.content_url || "#";

      const caption = `📌 *${name}*\n\n${desc}\n\n*আপলোড তারিখ:* ${date}`;
      const buttons = {
        inline_keyboard: [[{ text: "🎥 ভিডিও দেখুন", url: contentUrl }]]
      };

      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHANNEL_ID,
          photo: thumbnail,
          caption: caption,
          parse_mode: "Markdown",
          reply_markup: buttons
        })
      });
    }

    return res.status(200).send("✅ সব কন্টেন্ট সফলভাবে পোস্ট করা হয়েছে");
  } catch (err) {
    return res.status(500).send("❌ Error: " + err.message);
  }
}
