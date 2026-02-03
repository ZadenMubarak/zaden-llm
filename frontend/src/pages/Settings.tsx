import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";

export default function Settings() {
  return (
    <Layout>
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">
              More features coming soon!
            </p>
          </div>

          <Card className="p-12 text-center">
            <div className="space-y-4">
              <div className="text-5xl opacity-40">⚙️</div>
              <h2 className="text-2xl font-bold">Settings Coming Soon</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                We're working on adding theme preferences, notification settings,
                and more customization options. Check back soon!
              </p>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
