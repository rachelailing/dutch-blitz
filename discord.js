const app = document.querySelector("#app");

app.innerHTML = `
  <main>
    <h1>Dutch Blitz</h1>
    <p id="status">Loaded locally.</p>
  </main>
`;

async function setupDiscord() {
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;

  if (!clientId) {
    document.querySelector("#status").textContent =
      "Loaded locally. Add VITE_DISCORD_CLIENT_ID to connect the Discord SDK.";
    return;
  }

  try {
    const { DiscordSDK } = await import("@discord/embedded-app-sdk");
    const discordSdk = new DiscordSDK(clientId);

    await discordSdk.ready();
    document.querySelector("#status").textContent = "Discord Activity ready.";
    console.log("Discord Activity ready");
  } catch (error) {
    document.querySelector("#status").textContent =
      "Loaded locally. Discord SDK will be ready when opened inside Discord.";
    console.warn(error);
  }
}

setupDiscord();
