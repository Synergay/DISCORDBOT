# Xenon Hub Discord Bot

Serverless Discord bot hosted on Vercel.

## Setup

### 1. Discord Application
- Go to [Discord Developer Portal](https://discord.com/developers/applications)
- Create a new application
- Copy **Application ID** and **Public Key**
- Go to **Bot** tab, create a bot, copy the **Token**
- Under **Installation**, add the bot with `applications.commands` and `bot` scopes
- Bot permissions: `Send Messages`, `Embed Links`, `Use External Emojis`, `Mention Everyone`

### 2. Environment Variables
Set these in your Vercel project settings:

| Variable | Description |
|---|---|
| `DISCORD_APP_ID` | Your application ID |
| `DISCORD_PUBLIC_KEY` | Your public key |
| `DISCORD_BOT_TOKEN` | Your bot token |
| `UPDATE_CHANNEL_ID` | Channel ID for update posts |
| `UPDATE_ROLE_ID` | Role ID to ping for updates |

### 3. Deploy to Vercel
```bash
npm install
vercel --prod
```

### 4. Set Interactions Endpoint
In Discord Developer Portal → General Information → **Interactions Endpoint URL**:
```
https://your-vercel-url.vercel.app/api/interactions
```

### 5. Register Commands
```bash
DISCORD_APP_ID=xxx DISCORD_BOT_TOKEN=xxx node scripts/register.js
```

## Commands

| Command | Description |
|---|---|
| `/coinflip` | Flip a coin |
| `/gaycheck [user]` | Gay percentage checker |
| `/femboy [user]` | Femboy tester |
| `/simpcheck [user]` | Simp checker |
| `/rizz [user]` | Rizz meter |
| `/pp [user]` | PP size machine |
| `/iq [user]` | IQ test |
| `/8ball <question>` | Magic 8ball |
| `/features` | Show Xenon Hub features panel |
| `/credits` | Show credits panel |
| `/setup <channel> <function>` | Send a panel to a channel (Admin) |
| `/update <features> [note]` | Post an update (Dev only) |

## Update Usage
```
/update features: Auto Backstab Haruta, auto lock to BFC, Auto Feint For BFC note: BFC Bugs should all be fixed now
```
This formats and posts to your update channel with the role ping.
