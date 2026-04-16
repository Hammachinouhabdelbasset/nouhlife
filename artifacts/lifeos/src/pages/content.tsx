import { useState } from "react";
import {
  useListContent,
  useCreateContent,
  useUpdateContent,
  useDeleteContent,
  useGetContentPipeline,
  getListContentQueryKey,
  getGetContentPipelineQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Youtube, Twitter, Linkedin, PenTool, LayoutTemplate, MoreVertical, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ContentStudio() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: contents, isLoading: loadingContent } = useListContent();
  const { data: pipeline, isLoading: loadingPipeline } = useGetContentPipeline();

  const createContent = useCreateContent();
  const updateContent = useUpdateContent();
  const deleteContent = useDeleteContent();

  const handleStatusChange = (id: number, status: any) => {
    updateContent.mutate({ id, data: { status } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListContentQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetContentPipelineQueryKey() });
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteContent.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListContentQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetContentPipelineQueryKey() });
      }
    });
  };

  if (loadingContent || loadingPipeline) {
    return <div className="p-8">Loading content studio...</div>;
  }

  const stages = [
    { id: "raw_idea", label: "Ideas" },
    { id: "researching", label: "Researching" },
    { id: "scripting", label: "Scripting" },
    { id: "filming", label: "Filming/Creating" },
    { id: "editing", label: "Editing" },
    { id: "ready", label: "Ready" },
  ];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "youtube": return <Youtube className="h-4 w-4 text-red-500" />;
      case "twitter": return <Twitter className="h-4 w-4 text-sky-500" />;
      case "linkedin": return <Linkedin className="h-4 w-4 text-blue-600" />;
      case "blog": return <LayoutTemplate className="h-4 w-4 text-primary" />;
      default: return <PenTool className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Studio</h1>
          <p className="text-muted-foreground">From idea to published asset.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New Idea</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Capture Idea</DialogTitle>
            </DialogHeader>
            <ContentForm onSubmit={(data) => {
              createContent.mutate({ data }, {
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: getListContentQueryKey() });
                  queryClient.invalidateQueries({ queryKey: getGetContentPipelineQueryKey() });
                  setIsCreateOpen(false);
                }
              });
            }} />
          </DialogContent>
        </Dialog>
      </div>

      {pipeline && (
        <div className="grid gap-4 md:grid-cols-2 shrink-0">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Items</p>
                <h3 className="text-2xl font-bold">{pipeline.totalActive}</h3>
              </div>
              <PenTool className="h-8 w-8 text-primary opacity-50" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Published This Month</p>
                <h3 className="text-2xl font-bold text-primary">{pipeline.publishedThisMonth}</h3>
              </div>
              <Target className="h-8 w-8 text-primary opacity-50" />
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 h-[calc(100vh-16rem)] min-w-max pb-4">
          {stages.map(stage => {
            const stageItems = contents?.filter(c => c.status === stage.id) || [];
            return (
              <div key={stage.id} className="w-80 flex flex-col bg-muted/30 rounded-xl border border-border/50 p-3 h-full overflow-hidden">
                <div className="flex items-center justify-between mb-4 px-1 shrink-0">
                  <h3 className="font-semibold text-sm">{stage.label}</h3>
                  <Badge variant="secondary" className="rounded-full px-2">{stageItems.length}</Badge>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {stageItems.map(item => (
                    <Card key={item.id} className="p-3 bg-card hover:border-primary/50 transition-colors shadow-sm">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          {getPlatformIcon(item.platform)}
                          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{item.platform}</span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-5 w-5 -mr-1 -mt-1"><MoreVertical className="h-3 w-3 text-muted-foreground" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Move to</div>
                            {stages.filter(s => s.id !== stage.id).map(s => (
                              <DropdownMenuItem key={s.id} onClick={() => handleStatusChange(item.id, s.id)}>
                                {s.label}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuItem onClick={() => handleStatusChange(item.id, "published")} className="text-primary font-medium">
                              Publish
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-destructive mt-2">
                              <Trash className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <h4 className="text-sm font-semibold leading-snug mb-2">{item.title}</h4>
                      {item.hook && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 bg-muted/50 p-2 rounded border border-border/50">
                          {item.hook}
                        </p>
                      )}
                      {item.targetAudience && (
                        <div className="flex items-center gap-2 mt-auto">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {item.targetAudience}
                          </Badge>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Target(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

function ContentForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [title, setTitle] = useState("");
  const [hook, setHook] = useState("");
  const [platform, setPlatform] = useState("youtube");
  const [targetAudience, setTargetAudience] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onSubmit({
      title,
      hook,
      platform,
      targetAudience,
      status: "raw_idea",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Title/Topic</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Platform</label>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="youtube">YouTube</SelectItem>
            <SelectItem value="twitter">Twitter</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="tiktok">TikTok</SelectItem>
            <SelectItem value="blog">Blog</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">The Hook (first 3 seconds)</label>
        <Textarea value={hook} onChange={(e) => setHook(e.target.value)} rows={2} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Target Audience</label>
        <Input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="e.g. Junior Devs, Startup Founders" />
      </div>
      <Button type="submit" className="w-full">Save to Pipeline</Button>
    </form>
  );
}
