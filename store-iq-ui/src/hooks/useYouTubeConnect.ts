// src/hooks/useYouTubeConnect.ts
import { useState, useCallback } from "react";
import { toast } from "@/components/ui/use-toast";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_SCOPES =
  "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly";

function useYouTubeConnect() {
  const [ytConnected, setYtConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load Google Identity Services script
  const loadGisScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.getElementById("google-identity-services")) return resolve();
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.id = "google-identity-services";
      script.onload = () => resolve();
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }, []);

  // Fetch connection status
  const fetchConnectionStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/status", { credentials: "include" });
      if (res.ok) {
        const status = await res.json();
        setYtConnected(!!status.youtube);
      }
    } catch {
      setYtConnected(false);
    }
  }, []);

  // YouTube OAuth flow
  const handleYouTubeOAuth = useCallback(async () => {
    try {
      setLoading(true);

      if (
        !GOOGLE_CLIENT_ID ||
        typeof GOOGLE_CLIENT_ID !== "string" ||
        GOOGLE_CLIENT_ID.trim() === ""
      ) {
        toast({ description: "Google Client ID is not configured.", variant: "destructive" });
        setLoading(false);
        return;
      }
      if (
        !GOOGLE_SCOPES ||
        typeof GOOGLE_SCOPES !== "string" ||
        GOOGLE_SCOPES.trim() === ""
      ) {
        toast({ description: "Google OAuth scopes are not configured.", variant: "destructive" });
        setLoading(false);
        return;
      }

      await loadGisScript();

      // @ts-ignore
      if (
        !window.google ||
        !window.google.accounts ||
        !window.google.accounts.oauth2
      ) {
        toast({ description: "Google Identity Services failed to load.", variant: "destructive" });
        setLoading(false);
        return;
      }

      // @ts-ignore
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GOOGLE_SCOPES,
        prompt: "consent",
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error || !tokenResponse.access_token) {
            toast({
              description: tokenResponse.error_description || "YouTube OAuth failed",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
          try {
            const res = await fetch("/api/auth/link-youtube", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                accessToken: tokenResponse.access_token,
                refreshToken: tokenResponse.refresh_token || undefined,
              }),
            });
            if (!res.ok) throw new Error("Failed to link YouTube account");
            await fetchConnectionStatus();
            toast({ description: "YouTube account linked!", variant: "default" });
          } catch (err) {
            toast({
              description: (err as Error)?.message || "YouTube OAuth failed",
              variant: "destructive",
            });
          } finally {
            setLoading(false);
          }
        },
      });

      tokenClient.requestAccessToken();
    } catch (err) {
      toast({
        description: (err as Error)?.message || "YouTube OAuth failed",
        variant: "destructive",
      });
      setLoading(false);
    }
  }, [loadGisScript, fetchConnectionStatus]);

  // Disconnect YouTube
  const disconnectYouTube = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/disconnect-youtube", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to disconnect YouTube");
      await fetchConnectionStatus();
      toast({ description: "YouTube disconnected.", variant: "default" });
    } catch (err) {
      toast({
        description: (err as Error)?.message || "Failed to disconnect YouTube",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [fetchConnectionStatus]);

  // Initial fetch on mount
  useState(() => {
    fetchConnectionStatus();
  });

  return { ytConnected, loading, handleYouTubeOAuth, disconnectYouTube, fetchConnectionStatus };
}

export default useYouTubeConnect;