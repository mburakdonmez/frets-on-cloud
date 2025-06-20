import { z } from "zod/v4";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import type { Database } from "@/database.types";
import {
  discoverOAuthProtectedResourceMetadata,
  discoverOAuthMetadata,
  registerClient,
  exchangeAuthorization,
  auth,
} from "@modelcontextprotocol/sdk/client/auth.js";
import { customAlphabet } from "nanoid";
import { InspectorOAuthClientProvider } from "../../../utils/oauth/auth";

type MCPServerInsert = Database["public"]["Tables"]["mcp_servers"]["Insert"];
type MCPServerRow = Database["public"]["Tables"]["mcp_servers"]["Row"];
type AuthType = Database["public"]["Enums"]["auth_type"];
type TransportType = Database["public"]["Enums"]["mcp_transport"];

export const mcpServerModel = z
  .object({
    name: z.string().min(1, "Server name is required"),
    version: z.string().min(1, "Version is required"),
    auth_type: z.enum(["none", "token", "oauth"]),
  })
  .and(
    z.discriminatedUnion("transport", [
      z.object({
        transport: z.enum([
          "SSEClientTransport",
          "StreamableHTTPClientTransport",
        ]),
        url: z
          .string()
          .url("Invalid URL format")
          .refine(
            (url) => url.startsWith("http://") || url.startsWith("https://"),
            "URL must start with http:// or https://",
          ),
      }),
      z.object({
        transport: z.enum(["WebSocketClientTransport"]),
        url: z
          .string()
          .url("Invalid URL format")
          .refine(
            (url) => url.startsWith("ws://") || url.startsWith("wss://"),
            "URL must start with ws:// or wss://",
          ),
      }),
    ]),
  )
  .and(
    z.discriminatedUnion("auth_type", [
      z.object({
        auth_type: z.literal("none"),
      }),
      z.object({
        auth_type: z.literal("token"),
        auth_token: z.string().min(1, "Auth token is required"),
      }),
      z.object({
        auth_type: z.literal("oauth"),
        oauth_authorization_server: z
          .string()
          .url("Invalid authorization server URL")
          .optional()
          .or(z.literal("")), // Optional for initial save
        oauth_client_id: z
          .string()
          .min(1, "Client ID is required")
          .optional()
          .or(z.literal("")), // Optional for initial save
        oauth_client_secret: z
          .string()
          .min(1, "Client secret is required")
          .optional()
          .or(z.literal("")), // Optional for initial save
      }),
    ]),
  );

export type mcp = z.infer<typeof mcpServerModel>;

const generateCodeVerifier = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~",
  128,
);

interface CreateServerResponse {
  server: MCPServerRow;
  oauthStatusMessage?: string;
  oauthError?: string;
}

export const mcpRouter = createTRPCRouter({
  create: protectedProcedure
    .input(mcpServerModel)
    .mutation(async ({ ctx, input }): Promise<CreateServerResponse> => {
      const client = ctx.supabaseClient;
      const user = ctx.user;

      const response = await client
        .from("mcp_servers")
        .insert({
          name: input.name,
          transport: input.transport,
          url: input.url,
          version: input.version,
          auth_type: input.auth_type,
          ...(input.auth_type === "token" && {
            auth_token: input.auth_token,
          }),
          uid: user.id,
        })
        .select();

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (!response.data || response.data.length === 0) {
        throw new Error(
          "Failed to create MCP server: No data returned after insert.",
        );
      }

      let createdServer: MCPServerRow = response.data[0]!;
      if (!createdServer) {
        throw new Error(
          "Server creation failed: No data returned from database.",
        );
      }

      if (createdServer.auth_type === "oauth") {
        const provider = new InspectorOAuthClientProvider(createdServer.url);
        const result = await auth(provider, { serverUrl: createdServer.url });
        console.log({ result });
      }

      // if (createdServer.auth_type === "oauth") {
      //   try {
      //     // 1. Fetch resource metadata
      //     // console.log("Fetching resource metadata from:", createdServer.url);
      //     const resourceMetadata = await discoverOAuthProtectedResourceMetadata(
      //       createdServer.url,
      //     );

      //     if (
      //       !resourceMetadata ||
      //       !resourceMetadata.authorization_servers ||
      //       resourceMetadata.authorization_servers.length === 0
      //     ) {
      //       throw new Error(
      //         "OAuth setup failed: No authorization server found in resource metadata.",
      //       );
      //     }

      //     // 2. Extract authorization server URL
      //     const authServerUrl = new URL(
      //       resourceMetadata.authorization_servers[0] as string,
      //     );
      //     // console.log("Authorization Server URL:", authServerUrl.toString());

      //     // 3. Fetch authorization server metadata
      //     // console.log("Fetching authorization server metadata from:", authServerUrl.toString());
      //     const oauthMetadata = await discoverOAuthMetadata(authServerUrl);

      //     if (!oauthMetadata) {
      //       throw new Error(
      //         "OAuth setup failed: Failed to discover OAuth metadata from authorization server.",
      //       );
      //     }

      //     // 4. Perform Dynamic Client Registration
      //     // console.log("Performing dynamic client registration...");
      //     const clientRegistrationResponse = await registerClient(
      //       authServerUrl.toString(),
      //       {
      //         metadata: oauthMetadata,
      //         clientMetadata: {
      //           redirect_uris: [
      //             `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`,
      //           ],
      //           token_endpoint_auth_method: "none",
      //           grant_types: ["authorization_code", "refresh_token"],
      //           response_types: ["code"],
      //           client_name: "MCP Inspector Server",
      //         },
      //       },
      //     );

      //     // 5. Update mcp_servers entry with fetched OAuth details
      //     // console.log("Updating MCP server with OAuth details...");
      //     const updateResponse = await client
      //       .from("mcp_servers")
      //       .update({
      //         oauth_authorization_server: authServerUrl.toString(),
      //         oauth_client_id: clientRegistrationResponse.client_id,
      //         oauth_client_secret: clientRegistrationResponse.client_secret,
      //       })
      //       .eq("id", createdServer.id)
      //       .select();

      //     if (updateResponse.error) {
      //       throw new Error(updateResponse.error.message);
      //     }

      //     const updatedServer = updateResponse.data?.[0];
      //     if (!updatedServer) {
      //       throw new Error(
      //         "Server update failed: No data returned after update.",
      //       );
      //     }
      //     createdServer = updatedServer;

      //     return {
      //       server: createdServer,
      //       oauthStatusMessage: "OAuth setup complete!",
      //     };
      //   } catch (oauthError) {
      //     console.error("OAuth flow error:", oauthError);
      //     // Return the server object as it was initially created, along with the OAuth error
      //     return {
      //       server: createdServer,
      //       oauthError: `OAuth setup failed: ${(oauthError as Error).message}`,
      //     };
      //   }
      // }

      return { server: createdServer };
    }),
  // list: protectedProcedure.query(async ({ ctx }) => {
  //   const client = ctx.supabaseClient;
  //   const response = await client.from("mcp_servers").select();
  //   if (response.error) throw new Error(response.error.message);
  //   return response.data;
  // }),
});
