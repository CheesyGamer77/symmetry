import axios from "axios";
import { ROOT } from ".";

type SessionStartLimit = {
    total: number,
    remaining: number,
    reset_after: number,
    max_concurrency: number
}

type GetGatewayData = {
    url: string
}

type GetGatewayBotData = GetGatewayData & {
    shards: number,
    session_start_limit: SessionStartLimit
}

/**
 * Returns an object containing the websocket url to use to connect to Discord. Primarily used for clients and not bots.
 * @returns An object containing the websocket url.
 */
export async function getGateway() {
    const res = await axios.get(`${ROOT}/gateway`);
    return res.data as GetGatewayData;
}

/**
 * Returns similar information provided in {@link getGateway()} with additional data for bots, especially for sharding.
 * @param opts The options for the route.
 * @returns An object containing the websocket url and additional sharding metadata.
 */
export async function getGatewayBot(opts: { token: string }) {
    const url = `${ROOT}/gateway/bot`;
    console.log(`Obtaining gateway: ${url}`);
    return (
        await axios.get(`${ROOT}/gateway/bot`, { headers: {
            Authorization: `Bot ${opts.token}`
        }})
    ).data as GetGatewayBotData;
}
