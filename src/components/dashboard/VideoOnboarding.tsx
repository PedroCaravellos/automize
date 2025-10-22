import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const VIDEO_WATCHED_KEY = 'video_onboarding_watched';

export const VideoOnboarding = () => {
  const [open, setOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const hasWatched = localStorage.getItem(VIDEO_WATCHED_KEY);
    if (!hasWatched) {
      // Show after 2 seconds
      const timer = setTimeout(() => {
        setOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(VIDEO_WATCHED_KEY, 'true');
    }
    setOpen(false);
  };

  const handleWatch = () => {
    localStorage.setItem(VIDEO_WATCHED_KEY, 'true');
    // Video will play in the dialog
  };

  return (
    <>
      {/* Floating tooltip for manual access */}
      <div className="fixed bottom-24 right-6 z-40">
        <Button
          onClick={() => setOpen(true)}
          size="lg"
          className="rounded-full shadow-lg"
          variant="default"
        >
          <Play className="h-4 w-4 mr-2" />
          Ver vídeo rápido
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Bem-vindo! 👋</DialogTitle>
            <DialogDescription>
              Assista este vídeo de 90 segundos e aprenda a usar o sistema
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Video placeholder - user can replace with actual video URL */}
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center space-y-4 p-6">
                <Play className="h-16 w-16 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Adicione a URL do vídeo de onboarding aqui
                </p>
                <p className="text-xs text-muted-foreground">
                  Você pode usar YouTube, Vimeo ou Loom
                </p>
              </div>
              {/* Uncomment and replace with actual video URL:
              <iframe
                className="w-full h-full rounded-lg"
                src="YOUR_VIDEO_URL"
                title="Onboarding Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              */}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="dont-show"
                checked={dontShowAgain}
                onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
              />
              <label
                htmlFor="dont-show"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Não mostrar novamente
              </label>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleClose}>
                Pular
              </Button>
              <Button onClick={handleWatch}>
                Assistir e começar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
