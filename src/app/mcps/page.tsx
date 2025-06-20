import { ProtectedRoute, createClient } from "@/supabase/server";
import { MCPServersClient } from "./components/MCPServersClient";
import type { Database } from "@/database.types";

type MCPServer = Database["public"]["Tables"]["mcp_servers"]["Row"];

async function getInitialServers(): Promise<{
  servers: MCPServer[];
  error?: string;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mcp_servers")
    .select("*")
    .order("created_at", { ascending: false });

  return { servers: data ?? [], error: error?.message };
}

export default async function MCPServersPage() {
  const initialServers = await getInitialServers();

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container mx-auto px-4 py-8">
          <MCPServersClient initialServers={initialServers} />
        </div>
      </main>
    </ProtectedRoute>
  );
}
