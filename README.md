# Symmetry

An HTTP and Websocket API client for Discord, written in TypeScript.

This is meant to be a side passion project of mine, and is not intended to be used in production. Use at your own risk :p

## Example

```ts
import { GatewayManager, IntentBit } from 'symmetry';

(async () => {
    const client = new GatewayManager("YOUR BOT TOKEN", IntentBit.GUILDS | IntentBit.GUILD_MESSAGES | IntentBit.MESSAGE_CONTENT);  // define your client
    await client.login();  // login using the aformentioned token and intent bits
})
```
