"use server";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { WebSocketClientTransport } from "@modelcontextprotocol/sdk/client/websocket.js";
import type { Database } from "@/database.types";
import { assertUnreachable } from "@/utils/unreachable";
import {} from "@modelcontextprotocol/sdk/client/auth.js";

type MCPServer = Database["public"]["Tables"]["mcp_servers"]["Row"];
type Transport = MCPServer["transport"];

function getTransport(transport: Transport) {
  if (transport === "SSEClientTransport") return SSEClientTransport;
  if (transport === "StreamableHTTPClientTransport")
    return StreamableHTTPClientTransport;
  if (transport === "WebSocketClientTransport") return WebSocketClientTransport;
  if (transport === "StdioClientTransport")
    throw new Error(
      "Not supported. Transport type 'StdioClientTransport' is not supported.",
    );
  assertUnreachable(transport);
}

export async function getMCPDetails(mcpServer: MCPServer) {
  const Transport = getTransport(mcpServer.transport);
  const transport = new Transport(new URL(mcpServer.url));

  const client = new Client({
    name: mcpServer.name,
    version: mcpServer.version,
  });

  await transport.start();
  await client.connect(transport);

  const details = await Promise.all([
    client.listPrompts(),
    client.listResources(),
    client.listResourceTemplates(),
    client.listTools(),
    client.getServerCapabilities(),
  ]);

  return details;
}
