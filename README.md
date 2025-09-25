# Skoliosis

A multiplayer, cross-server snake bot. Team up to play snake with your server. Finish first for bragging rights! :D

## Deploying

If you haven't already, create a bot application with [this guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html).

Duplicate the file named `config.example.json` and name your new file `config.json`. Change the following two options in your config to match your bot application:

```json
{
	"token": "bot-token-goes-here",
    "clientId": "client-id-goes-here"
}
```

Once that's done, run these commands:

```bash
npm install
npm start
```


## To-do

[X] Save best game scores and use those on the leaderboard

[X] Button that resets the game when it should be reset (such as on a game over)

[ ] Replace the config.json with YAML-based config because JSON has no comments and it's getting on my nerves

[ ] Make the leaderboard more efficient
