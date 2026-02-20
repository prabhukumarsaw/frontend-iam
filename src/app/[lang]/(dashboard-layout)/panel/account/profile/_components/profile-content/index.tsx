import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileContentInfo } from "./profile-content-info"
import { ProfileContentMainFeed } from "./profile-content-main-feed"
import { ProfileContentConnectionList } from "./profile-content-info-connection-list"
import { ProfileContentIntroList } from "./profile-content-info-intro-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ProfileContent() {
  return (
    <section className="p-4 md:p-8">
      <Tabs defaultValue="timeline" className="w-full">
        <div className="flex items-center justify-center md:justify-start overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="bg-transparent h-auto p-0 gap-6 md:gap-8 rounded-none border-b border-border w-full justify-start">
            <TabsTrigger
              value="timeline"
              className="px-0 py-3 text-sm font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all hover:text-primary"
            >
              Timeline
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="px-0 py-3 text-sm font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all hover:text-primary"
            >
              About
            </TabsTrigger>
            <TabsTrigger
              value="connections"
              className="px-0 py-3 text-sm font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all hover:text-primary"
            >
              Connections
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="timeline" className="mt-6 ring-offset-background focus-visible:outline-none">
          <div className="flex flex-col gap-6 md:flex-row">
            <ProfileContentInfo />
            <ProfileContentMainFeed />
          </div>
        </TabsContent>

        <TabsContent value="about" className="mt-6 animate-in fade-in-50 duration-300">
          <Card className="border-none shadow-none md:border md:shadow-sm">
            <CardHeader>
              <CardTitle>Detailed Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileContentIntroList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connections" className="mt-6 animate-in fade-in-50 duration-300">
          <Card className="border-none shadow-none md:border md:shadow-sm">
            <CardHeader>
              <CardTitle>Your Network</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileContentConnectionList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  )
}
