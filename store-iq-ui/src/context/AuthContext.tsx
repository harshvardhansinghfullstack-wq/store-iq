import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { toast } from "react-hot-toast";
import { useLocation } from "react-router-dom";

interface User {
  id: string;
  email: string;
  username?: string;
  timezone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateTimezone: (timezone: string) => Promise<void>;
  loading: boolean; // NEW
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // NEW
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;
    let normalizedPath = pathname
      ? pathname.replace(/\/+$/, "").toLowerCase()
      : "/";
    if (normalizedPath === "") normalizedPath = "/";

    const publicRoutes = ["/", "/login", "/signup", "/about", "/tools"];
    const isPublic =
      publicRoutes.includes(normalizedPath) ||
      normalizedPath.startsWith("/login/") ||
      normalizedPath.startsWith("/signup/");

    if (isPublic) {
      setUser(null);
      setToken(null);
      setAuthError(null);
      setLoading(false); // NEW
      return;
    }

    const storedToken = localStorage.getItem("token");

    const handleAuthMeResponse = async (res: Response) => {
      if (res.ok) {
        const data = await res.json();
        if (data && data.user) {
          setUser(data.user);
          setAuthError(null);
        } else {
          setUser(null);
          setToken(null);
          localStorage.removeItem("token");
          setAuthError("Authentication failed.");
        }
      } else if (res.status === 404) {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        setAuthError("User not found. Please log in again.");
        window.location.assign("/login");
      } else if (res.status === 401 || res.status === 403) {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        setAuthError("Session expired. Please log in again.");
      } else if (res.status >= 500) {
        setAuthError(
          "The server is temporarily unavailable. Please try again later."
        );
      } else {
        setAuthError("An unknown error occurred.");
      }
      setLoading(false); // NEW
    };

    const fetchUser = async () => {
      try {
        if (storedToken) {
          setToken(storedToken);
          const res = await fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${storedToken}` },
            credentials: "include",
          });
          await handleAuthMeResponse(res);
        } else {
          const res = await fetch("/api/auth/me", { credentials: "include" });
          await handleAuthMeResponse(res);
        }
      } catch {
        setAuthError(
          "Unable to connect to the server. Please check your connection."
        );
        setLoading(false);
      }
    };

    fetchUser();
  }, [location.pathname]);
// Show toast after successful Google login or signup (with ?logged_in=1 or ?signed_up=1)
useEffect(() => {
  if (!loading && user) {
    const params = new URLSearchParams(location.search);
    let toastShown = false;
    if (params.get("logged_in") === "1") {
      toast("Logged in successfully", { icon: "✅" });
      params.delete("logged_in");
      toastShown = true;
    }
    if (params.get("signed_up") === "1") {
      toast("Signed up successfully", { icon: "✅" });
      params.delete("signed_up");
      toastShown = true;
    }
    if (toastShown) {
      const newSearch = params.toString();
      const newUrl =
        location.pathname + (newSearch ? `?${newSearch}` : "");
      window.history.replaceState({}, "", newUrl);
    }
  }
  // Only run when user or loading changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [user, loading, location.search, location.pathname]);

  const login = (_jwt: string, userObj: User) => {
    setToken(_jwt);
    setUser(userObj);
    if (_jwt) localStorage.setItem("token", _jwt);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  const updateTimezone = async (timezone: string) => {
    if (!user) return;
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ timezone }),
      });
      if (!res.ok) throw new Error("Failed to update timezone");

      const userRes = await fetch("/api/auth/me", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });
      if (userRes.ok) {
        const data = await userRes.json();
        if (data && data.user) setUser(data.user);
      }
    } catch (err) {
      // optionally handle error
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, updateTimezone, loading }}
    >
      {authError && (
        <div style={{ color: "red", textAlign: "center", margin: "1em" }}>
          {authError}
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
