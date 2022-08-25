import { getGatewayBot } from "../client/routes/gateway";
import WebSocket from "ws";
import { API_VERSION } from "..";

interface GatewayPayload<DataType> {
    op: number,
    d: DataType | null,
    s: number | null,
    t: string | null
}

type GatewayState = "closed" | "connecting" | "ready" | "reconnecting";

function bit(n: number) {
    return 1 << n;
}

export enum IntentBit {
    GUILDS = bit(0),
    GUILD_MEMBERS = bit(1),
    GUILD_BANS = bit(2),
    GUILD_EMOJIS_AND_STICKERS = bit(3),
    GUILD_INTEGRATIONS = bit(4),
    GUILD_WEBHOOKS = bit(5),
    GUILD_INVITES = bit(6),
    GUILD_VOICE_STATES = bit(7),
    GUILD_PRESENCES = bit(8),
    GUILD_MESSAGES = bit(9),
    GUILD_MESSAGE_REACTIONS = bit(10),
    GUILD_MESSAGE_TYPING = bit(11),
    DIRECT_MESSAGES = bit(12),
    DIRECT_MESSAGE_REACTIONS = bit(13),
    DIRECT_MESSAGE_TYPING = bit(14),
    MESSAGE_CONTENT = bit(15),
    GUILD_SCHEDULED_EVENTS = bit(16),
    // 17, 18, 19
    AUTO_MODERATION_CONFIGURATION = bit(20),
    AUTO_MODERATION_EXECUTION = bit(21)
}

enum OpCode {
    DISPATCH,
    HEARTBEAT,
    IDENTIFY,
    PRESENCE_UPDATE,
    VOICE_STATE_UPDATE,
    RESUME = 6,
    RECONNECT,
    REQUEST_GUILD_MEMBERS,
    INVALID_SESSION,
    HELLO,
    HEARTBEAT_ACK
}

export class GatewayManager {
    public readonly intents: number;

    private readonly token: string;
    private state: GatewayState = "closed";
    private ws: WebSocket | null = null;
    private heartbeat: NodeJS.Timeout | null = null;
    private heartbeatInterval: number = 0;
    private sequenceNumber: bigint | null = null;

    constructor(token: string, intents: number) {
        this.token = token;
        this.intents = intents;
    }

    async login() {
        this.state = "connecting";
        const res = await getGatewayBot({ token: this.token });
        const url = `${res.url}?v=${API_VERSION}&encoding=json`;
        this.ws = new WebSocket(url);
        this.ws.on('message', async (data: WebSocket.RawData) => await this.handleIncoming(data));
    }

    async handleIncoming(raw: WebSocket.RawData) {
        const packet = JSON.parse(raw.toString()) as GatewayPayload<any>;

        console.log(`Received OP: ${packet.op} ('${OpCode[packet.op]}') - '${packet.t}'`);
        if(this.state == "connecting") {
            // most likely receiving a "HELLO" op. Send identify and setup heartbeat
            if(packet.op == OpCode.HELLO) {
                // send identify
                await this.send({
                    op: OpCode.IDENTIFY,
                    d: {
                        token: this.token,
                        properties: {
                            os: "Linux",
                            browser: "Symmetry",
                            device: "Symmetry"
                        },
                        intents: this.intents
                    }
                })

                // setup heartbeat
                this.heartbeatInterval = packet.d['heartbeat_interval']
                this.heartbeat = setTimeout(async () => await this.sendHeartbeat(), this.heartbeatInterval * Math.random());
            }
        }
    }

    async sendHeartbeat() {
        if(this.state != "closed") {
            console.log("Sending heartbeat");

            await this.send({
                op: OpCode.HEARTBEAT,
                d: this.sequenceNumber
            });

            this.heartbeat = setTimeout(async () => await this.sendHeartbeat(), this.heartbeatInterval);
        }
    }

    async send(data: Omit<GatewayPayload<any>, "s" | "t">,) {
        if(this.state != "closed") {
            this.ws?.send(JSON.stringify(data));
        }
    }
}