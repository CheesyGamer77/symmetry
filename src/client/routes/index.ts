import { API_VERSION } from "../..";
import { getGateway, getGatewayBot } from "./gateway" 

export const ROOT = `https://discord.com/api/v${API_VERSION}` as const;
export const gateway = {
    getGateway,
    getGatewayBot
}