import { useState } from "react";
import {
  useListNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  useGetNotesStats,
  getListNotesQueryKey,
  getGetNotesStatsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Folder, Hash, Pin, Star, MoreVertical, Trash } from "lucide-react";
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
import { format } from "date-fns";

export default function Knowledge() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: notes, isLoading: loadingNotes } = useListNotes({
    category: category !== "all" ? category : undefined,
    search: search || undefined
  });
  const { data: stats } = useGetNotesStats();

  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const handleDelete = (id: number) => {
    deleteNote.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetNotesStatsQueryKey() });
        },
      }
    );
  };

  const togglePin = (note: any) => {
    updateNote.mutate({
      id: note.id,
      data: { pinned: !note.pinned }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
      }
    });
  };

  if (loadingNotes) {
    return <div className="p-8">Loading knowledge vault...</div>;
  }

  const pinnedNotes = notes?.filter(n => n.pinned) || [];
  const regularNotes = notes?.filter(n => !n.pinned) || [];

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Sidebar */}
      <div className="w-64 flex flex-col gap-6 shrink-0">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight px-2">Categories</h2>
          <div className="space-y-1 mt-2">
            <Button 
              variant={category === "all" ? "secondary" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setCategory("all")}
            >
              <Folder className="mr-2 h-4 w-4" /> All Notes
              {stats && <span className="ml-auto text-xs text-muted-foreground">{stats.total}</span>}
            </Button>
            {stats?.byCategory.map((cat) => (
              <Button 
                key={cat.category}
                variant={category === cat.category ? "secondary" : "ghost"} 
                className="w-full justify-start capitalize"
                onClick={() => setCategory(cat.category)}
              >
                <Folder className="mr-2 h-4 w-4" /> {cat.category}
                <span className="ml-auto text-xs text-muted-foreground">{cat.count}</span>
              </Button>
            ))}
          </div>
        </div>

        {stats && (
          <div className="mt-auto px-2 space-y-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Recently updated: </span>
              <span className="font-medium">{stats.recentlyUpdated}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Pinned: </span>
              <span className="font-medium">{stats.pinned}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center gap-4 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search knowledge vault..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted/50 border-none focus-visible:ring-1"
            />
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> New Note</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Note</DialogTitle>
              </DialogHeader>
              <NoteForm onSubmit={(data) => {
                createNote.mutate({ data }, {
                  onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
                    queryClient.invalidateQueries({ queryKey: getGetNotesStatsQueryKey() });
                    setIsCreateOpen(false);
                  }
                });
              }} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {pinnedNotes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center text-muted-foreground">
                <Pin className="mr-2 h-4 w-4" /> Pinned
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {pinnedNotes.map(note => (
                  <NoteCard key={note.id} note={note} onTogglePin={() => togglePin(note)} onDelete={() => handleDelete(note.id)} />
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center text-muted-foreground">
              <Folder className="mr-2 h-4 w-4" /> {category === "all" ? "All Notes" : category}
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {regularNotes.map(note => (
                <NoteCard key={note.id} note={note} onTogglePin={() => togglePin(note)} onDelete={() => handleDelete(note.id)} />
              ))}
            </div>
            {regularNotes.length === 0 && (
              <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">
                No notes found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NoteCard({ note, onTogglePin, onDelete }: { note: any, onTogglePin: () => void, onDelete: () => void }) {
  return (
    <Card className="flex flex-col group hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3 px-4 pt-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base leading-tight line-clamp-1">{note.title}</CardTitle>
            <CardDescription className="text-xs">{format(new Date(note.updatedAt), "MMM d, yyyy")}</CardDescription>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onTogglePin}>
              <Pin className={`h-3 w-3 ${note.pinned ? "fill-primary text-primary" : "text-muted-foreground"}`} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="h-3 w-3 text-muted-foreground" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground line-clamp-3 flex-1 mb-4 whitespace-pre-wrap font-mono text-xs">
          {note.content}
        </p>
        <div className="flex items-center gap-2 mt-auto">
          <span className="text-xs bg-secondary px-2 py-0.5 rounded capitalize">{note.category}</span>
          {note.tags?.slice(0, 2).map((tag: string) => (
            <span key={tag} className="text-xs text-muted-foreground flex items-center">
              <Hash className="h-3 w-3 mr-0.5" />{tag}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function NoteForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("engineering");
  const [tagsStr, setTagsStr] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    const tags = tagsStr.split(",").map(t => t.trim()).filter(Boolean);
    onSubmit({
      title,
      content,
      category,
      tags,
      pinned: false,
      favorite: false
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input placeholder="Note Title" value={title} onChange={(e) => setTitle(e.target.value)} required className="text-lg font-semibold border-none bg-muted/50 focus-visible:ring-1" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="engineering">Engineering</SelectItem>
            <SelectItem value="content">Content</SelectItem>
            <SelectItem value="project">Project</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="Tags (comma separated)" value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Textarea 
          placeholder="Start typing..." 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          required 
          className="min-h-[300px] font-mono text-sm border-none bg-muted/50 focus-visible:ring-1 resize-none"
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit">Save Note</Button>
      </div>
    </form>
  );
}
