export async function notifyLine(token, userId, message) {
  if (!token || !userId) throw new Error("LINEの通知設定が不足しています");
  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ to: userId, messages: [{ type: "text", text: message.slice(0, 5000) }] })
  });
  if (!response.ok) throw new Error(`LINE通知に失敗しました: ${response.status} ${await response.text()}`);
}
