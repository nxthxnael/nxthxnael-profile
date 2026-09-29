const ACCENT_COLOR = 0x4338ca;

export type DiscordNotification = {
  title: string;
  fields: { name: string; value: string; inline?: boolean }[];
};

export async function sendDiscordNotification(
  notification: DiscordNotification,
) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [
        {
          title: notification.title,
          color: ACCENT_COLOR,
          fields: notification.fields,
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  });

  if (!response.ok) {
    console.error(
      `Discord webhook returned ${response.status}: ${await response.text()}`,
    );
  }
}
