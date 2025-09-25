# Skoliosis

A multiplayer, cross-server snake bot. Team up to play snake with your server. Get the highest score with the least moves to get on the leaderboard!

## Deploying

If you haven't already, create a bot application with [this guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html).

Duplicate the file named `config.example.yaml` and name your new file `config.yaml`. Change the following two options in your config to match your bot application:

```yaml
# Your bot's token and client ID should go below.
token: your-token-goes-here
clientId: your-client-id-goes-here
```

Once that's done, run these commands:

```bash
npm install
npm start
```
