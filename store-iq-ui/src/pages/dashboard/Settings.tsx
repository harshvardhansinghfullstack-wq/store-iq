import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

import { useState, useEffect } from "react";
import { DateTime, Info } from "luxon";
import useYouTubeConnect from "@/hooks/useYouTubeConnect";

// Cookie helpers
function setCookie(name: string, value: string, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie =
    name +
    "=" +
    encodeURIComponent(value) +
    "; expires=" +
    expires +
    "; path=/";
}
function getCookie(name: string) {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, "");
}

// Enhanced SVG Icons
const EyeIcon = ({ open }: { open: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {open ? (
      <>
        <path
          d="M3 12C5.5 7 9.5 4 12 4C14.5 4 18.5 7 21 12C18.5 17 14.5 20 12 20C9.5 20 5.5 17 3 12Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18 6L6 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ) : (
      <>
        <path
          d="M3 12C5.5 7 9.5 4 12 4C14.5 4 18.5 7 21 12C18.5 17 14.5 20 12 20C9.5 20 5.5 17 3 12Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
  </svg>
);

const SettingsIcon = ({ active }: { active: boolean }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.4 15C19.2662 15.4 19.4 15.7333 19.8 15.8667L21 16.4667C21.4 16.6 21.5333 17.0667 21.2666 17.4L20.2666 18.6667C20 19 20.1333 19.4667 20.5333 19.6L21.7333 20.2C22.1333 20.3333 22.2666 20.8 22 21.1333L21 22.4C20.7333 22.7333 20.2666 22.7333 20 22.4667L18.7333 21.4667C18.4 21.2 17.9333 21.3333 17.8 21.7333L17.2 22.9333C17.0666 23.3333 16.6 23.4667 16.2666 23.2L15 22.2C14.6666 21.9333 14.2 22.0667 14 22.4667L13.4 23.6667C13.2666 24.0667 12.8 24.2 12.4666 23.9333L11.2 22.9333C10.8666 22.6667 10.4 22.8 10.2666 23.2L9.66665 24.4C9.53331 24.8 9.06665 24.9333 8.73331 24.6667L7.46665 23.6667C7.13331 23.4 6.66665 23.5333 6.46665 23.9333L5.86665 25.1333C5.73331 25.5333 5.26665 25.6667 4.93331 25.4L3.66665 24.4C3.33331 24.1333 2.86665 24.2667 2.73331 24.6667L2.13331 25.8667C1.99998 26.2667 2.13331 26.7333 2.53331 26.8667L3.73331 27.4667C4.13331 27.6 4.26665 28.0667 4.00065 28.4L3.00065 29.6667C2.73398 30 2.26665 30 2.00065 29.7333L0.733313 28.7333C0.39998 28.4667 0.266646 28 0.466646 27.6L1.06665 26.4C1.19998 26 0.933313 25.5333 0.533313 25.4L1.73331 24.8C2.13331 24.6667 2.26665 24.2 2.00065 23.8667L3.00065 22.6C3.26665 22.2667 3.13331 21.8 2.73331 21.6667L1.53331 21.0667C1.13331 20.9333 0.99998 20.4667 1.26665 20.1333L2.26665 18.8667C2.53331 18.5333 2.99998 18.5333 3.26665 18.8L4.53331 19.8C4.86665 20.0667 5.33331 19.9333 5.46665 19.5333L6.06665 18.3333C6.19998 17.9333 6.66665 17.8 7.00065 18.0667L8.26665 19.0667C8.60065 19.3333 9.06665 19.2 9.26665 18.8L9.86665 17.6C10 17.2 10.4666 17.0667 10.8 17.3333L12.0666 18.3333C12.4 18.6 12.8666 18.4667 13 18.0667L13.6 16.8667C13.7333 16.4667 14.2 16.3333 14.5333 16.6L15.8 17.6C16.1333 17.8667 16.6 17.7333 16.8 17.3333L17.4 16.1333C17.5333 15.7333 17.2666 15.2667 16.8666 15.1333L15.6666 14.5333C15.2666 14.4 15.1333 13.9333 15.4 13.6L16.4 12.3333C16.6666 12 16.5333 11.5333 16.1333 11.4L14.9333 10.8C14.5333 10.6667 14.4 10.2 14.6666 9.86667L15.6666 8.6C15.9333 8.26667 15.8 7.8 15.4 7.66667L14.2 7.06667C13.8 6.93333 13.6666 6.46667 13.9333 6.13333L14.9333 4.86667C15.2 4.53333 15.6666 4.53333 15.9333 4.8L17.2 5.8C17.5333 6.06667 18 5.93333 18.1333 5.53333L18.7333 4.33333C18.8666 3.93333 18.6 3.46667 18.2 3.33333L17 2.73333C16.6 2.6 16.4666 2.13333 16.7333 1.8L17.7333 0.533333C18 0.2 18.4666 0.2 18.7333 0.466667L20 1.46667C20.3333 1.73333 20.4666 2.2 20.2666 2.6L19.6666 3.8C19.5333 4.2 19.8 4.66667 20.2 4.8L21.4 5.4C21.8 5.53333 21.9333 6 21.6666 6.33333L20.6666 7.6C20.4 7.93333 20.5333 8.4 20.9333 8.53333L22.1333 9.13333C22.5333 9.26667 22.6666 9.73333 22.4 10.0667L21.4 11.3333C21.1333 11.6667 21.2666 12.1333 21.6666 12.2667L22.8666 12.8667C23.2666 13 23.4 13.4667 23.1333 13.8L22.1333 15.0667C21.8666 15.4 21.4 15.4 21.1333 15.1333L19.8666 14.1333C19.5333 13.8667 19.0666 14 18.8666 14.4L18.2666 15.6C18.1333 16 17.6666 16.1333 17.3333 15.8667L16.0666 14.8667C15.7333 14.6 15.2666 14.7333 15.1333 15.1333L14.5333 16.3333C14.4 16.7333 14.6666 17.2 15.0666 17.3333L16.2666 17.9333C16.6666 18.0667 16.8 18.5333 16.5333 18.8667L15.5333 20.1333C15.2666 20.4667 14.8 20.4667 14.5333 20.2L13.2666 19.2C12.9333 18.9333 12.4666 19.0667 12.3333 19.4667L11.7333 20.6667C11.6 21.0667 11.8666 21.5333 12.2666 21.6667L13.4666 22.2667C13.8666 22.4 14 22.8667 13.7333 23.2L12.7333 24.4667C12.4666 24.8 12 24.8 11.7333 24.5333L10.4666 23.5333C10.1333 23.2667 9.66665 23.4 9.46665 23.8L8.86665 25C8.73331 25.4 8.26665 25.5333 7.93331 25.2667L6.66665 24.2667C6.33331 24 5.86665 24.1333 5.73331 24.5333L5.13331 25.7333C4.99998 26.1333 5.26665 26.6 5.66665 26.7333L6.86665 27.3333C7.26665 27.4667 7.39998 27.9333 7.13331 28.2667L6.13331 29.5333C5.86665 29.8667 5.39998 29.8667 5.13331 29.6L3.86665 28.6C3.53331 28.3333 3.06665 28.4667 2.86665 28.8667L2.26665 30.0667C2.13331 30.4667 2.39998 30.9333 2.79998 31.0667L4 31.6667C4.4 31.8 4.53331 32.2667 4.26665 32.6L3.26665 33.8667C2.99998 34.2 3.13331 34.6667 3.53331 34.8L4.73331 35.4C5.13331 35.5333 5.26665 36 5.00065 36.3333L4.00065 37.6C3.73398 37.9333 3.26665 37.9333 3.00065 37.6667L1.73331 36.6667C1.39998 36.4 0.933313 36.5333 0.733313 36.9333L0.133313 38.1333C-0.000020752 38.5333 0.266646 39 0.666646 39.1333L1.86665 39.7333C2.26665 39.8667 2.39998 40.3333 2.13331 40.6667L1.13331 41.9333C0.866646 42.2667 1.00065 42.7333 1.40065 42.8667L2.60065 43.4667C3.00065 43.6 3.13398 44.0667 2.86731 44.4L1.86731 45.6667C1.60065 46 1.13398 46 0.867313 45.7333L0.533313 45.4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ClockIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <path
      d="M12 6V12L16 14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IntegrationIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 12H16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 16V8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 12H5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19 12H21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 3V5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 19V21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const ChannelIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="3"
      y="6"
      width="18"
      height="12"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M7 3V6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M17 3V6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M7 18V21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M17 18V21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="8" cy="12" r="1" fill="currentColor" />
    <circle cx="16" cy="12" r="1" fill="currentColor" />
  </svg>
);

const PasswordIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="3"
      y="10"
      width="18"
      height="11"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M7 10V6C7 3.79086 8.79086 2 11 2H13C15.2091 2 17 3.79086 17 6V10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="12" cy="15" r="1" fill="currentColor" />
  </svg>
);

const AccountIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
    <path
      d="M5 20C5 16.134 8.13401 13 12 13C15.866 13 19 16.134 19 20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const LogoutIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 17L21 12L16 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 12H9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

import { useRef } from "react";
const Settings = () => {
  const { user, logout, updateTimezone } = useAuth();
  const navigate = useNavigate();
  const {
    ytConnected,
    loading: ytLoading,
    handleYouTubeOAuth,
    disconnectYouTube,
  } = useYouTubeConnect();
  // Use IANA timezone, default to user's or system's
  const [timezone, setTimezone] = useState(
    user?.timezone || DateTime.local().zoneName
  );
  const [updatingTimezone, setUpdatingTimezone] = useState(false);
  const [currentTime, setCurrentTime] = useState(
    DateTime.now().setZone(timezone)
  );

  // Persist timezone to cookie when it changes (in case setTimezone is called elsewhere)
  useEffect(() => {
    setCookie("selectedTimezone", timezone);
  }, [timezone]);

  // Enhanced timezone list with better organization
  const timezones = [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Toronto",
    "America/Vancouver",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Europe/Madrid",
    "Europe/Rome",
    "Europe/Moscow",
    "Asia/Kolkata",
    "Asia/Shanghai",
    "Asia/Tokyo",
    "Asia/Singapore",
    "Asia/Hong_Kong",
    "Asia/Bangkok",
    "Asia/Dubai",
    "Australia/Sydney",
    "Australia/Melbourne",
    "Pacific/Auckland",
    "Pacific/Honolulu",
    "Africa/Johannesburg",
    "Africa/Cairo",
    "America/Sao_Paulo",
    "America/Bogota",
    "America/Mexico_City",
    "Europe/Istanbul",
    "Europe/Warsaw",
    "Europe/Zurich",
    "Asia/Seoul",
    "Asia/Jakarta",
    "Asia/Kuala_Lumpur",
    "Asia/Manila",
    "Asia/Taipei",
    "Asia/Riyadh",
    "Asia/Ho_Chi_Minh",
    "Asia/Baku",
    "Asia/Yangon",
    "Asia/Kathmandu",
    "Asia/Colombo",
    "Asia/Karachi",
    "Asia/Tashkent",
    "Asia/Almaty",
    "Asia/Novosibirsk",
    "Asia/Vladivostok",
    "Asia/Sakhalin",
    "Asia/Magadan",
    "Asia/Kamchatka",
    "Pacific/Guam",
    "Pacific/Fiji",
    "Pacific/Tongatapu",
  ];

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(DateTime.now().setZone(timezone));
    }, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleTimezoneChange = async (value: string) => {
    setUpdatingTimezone(true);
    setTimezone(value);
    setCookie("selectedTimezone", value);
    await updateTimezone(value);
    setUpdatingTimezone(false);
  };

  // Enhanced sidebar navigation with icons
  const sidebarItems = [
    { label: "Your Timezone", icon: ClockIcon },
    { label: "Integrations", icon: IntegrationIcon },
    { label: "Channel Manager", icon: ChannelIcon },
    { label: "Password Management", icon: PasswordIcon },
    { label: "Account", icon: AccountIcon },
  ];

  const [activeTab, setActiveTab] = useState(sidebarItems[0].label);
  // Refs for mobile tab buttons
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Password management form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Password visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || "Failed to update password.");
      } else {
        setPasswordSuccess("Password updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setPasswordError("Network error. Please try again.");
    }
    setPasswordLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 bg-[#111111] min-h-screen">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon active={true} />
            <h1 className="text-2xl md:text-4xl font-bold text-white">
              Account Settings
            </h1>
          </div>
          <p className="text-white/60 text-base md:text-lg">
            Manage your account preferences and security
          </p>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="flex md:hidden mb-4 overflow-x-auto gap-2 hide-scrollbar">
          {sidebarItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={index}
                ref={(el) => (tabRefs.current[index] = el)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTab === item.label
                    ? "bg-gradient-to-r from-[#6E42E1] to-[#8B5CF6] text-white shadow"
                    : "text-white/70 hover:text-white hover:bg-[#6E42E1]/20"
                }`}
                onClick={() => {
                  setActiveTab(item.label);
                  // Scroll the clicked tab into view
                  tabRefs.current[index]?.scrollIntoView({
                    behavior: "smooth",
                    inline: "start",
                    block: "nearest",
                  });
                }}
              >
                <IconComponent />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col md:flex-row md:gap-8 items-stretch h-full">
          {/* Enhanced Left Sidebar (hidden on mobile) */}
          <aside className="hidden md:flex md:w-80 flex-shrink-0 h-full flex-col">
            <div className="bg-gradient-to-b from-[#1E1E1E] to-[#2A2A2A] border border-[#3A3A3A] rounded-2xl p-6 shadow-2xl flex flex-col h-full">
              <div className="space-y-1 flex-1 flex flex-col">
                {sidebarItems.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={index}
                      className={`w-full flex items-center gap-4 text-left px-4 py-4 rounded-xl transition-all duration-200 text-base font-medium group ${
                        activeTab === item.label
                          ? "bg-gradient-to-r from-[#6E42E1] to-[#8B5CF6] text-white shadow-lg"
                          : "text-white/70 hover:text-white hover:bg-[#6E42E1]/20 hover:translate-x-1"
                      }`}
                      onClick={() => setActiveTab(item.label)}
                    >
                      <IconComponent />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Enhanced Main Content Area */}
          <main className="flex-1 flex flex-col h-full">
            {/* Your Timezone Section */}
            {activeTab === "Your Timezone" && (
              <div className="bg-gradient-to-br from-[#1E1E1E] to-[#2A2A2A] border border-[#3A3A3A] rounded-2xl p-4 md:p-8 shadow-2xl">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
                      <ClockIcon />
                      Timezone Settings
                    </h3>
                    <div className="space-y-4">
                      <label className="block text-white/80 text-sm font-medium">
                        Select Your Timezone
                      </label>
                      <Select
                        value={timezone}
                        onValueChange={handleTimezoneChange}
                        disabled={updatingTimezone}
                      >
                        <SelectTrigger className="w-full max-w-md bg-[#2A2A2A] border-[#3A3A3A] text-white h-12 hover:border-[#6E42E1] transition-colors">
                          <SelectValue placeholder="Select a timezone" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#2A2A2A] border-[#3A3A3A] text-white">
                          {timezones.map((tz) => (
                            <SelectItem
                              key={tz}
                              value={tz}
                              className="focus:bg-[#6E42E1] focus:text-white hover:bg-[#6E42E1]/30"
                            >
                              {tz}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Enhanced Live Clock */}
                  <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl p-4 md:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white font-mono text-2xl font-bold">
                          {currentTime.toFormat("HH:mm:ss")}
                        </span>
                        <div className="text-white/80 text-sm mt-1">
                          {currentTime.toFormat("cccc, dd LLL yyyy")}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[#6E42E1] font-semibold text-lg">
                          {timezone}
                        </span>
                        <div className="text-white/60 text-sm">Live</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-[#2A2A2A] rounded-lg">
                    <Switch
                      defaultChecked
                      id="email-notifications"
                      className="data-[state=checked]:bg-[#6E42E1]"
                    />
                    <label
                      htmlFor="email-notifications"
                      className="text-white font-medium"
                    >
                      Enable email notifications for schedule updates
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Integrations Section */}
            {activeTab === "Integrations" && (
              <div className="bg-gradient-to-br from-[#1E1E1E] to-[#2A2A2A] border border-[#3A3A3A] rounded-2xl p-4 md:p-8 shadow-2xl flex flex-col h-full">
                <div className="flex-1 flex flex-col">
                  <h3 className="text-white text-xl font-semibold mb-2 flex items-center gap-2">
                    <IntegrationIcon />
                    Social Integrations
                  </h3>
                  <p className="text-white/60 mb-6">
                    Connect your social media accounts to schedule content
                    seamlessly
                  </p>

                  <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl p-4 md:p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white font-medium">
                        Current Connections
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          ytConnected
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {ytConnected ? "1 Connected" : "No connections"}
                      </span>
                    </div>
                    {ytConnected && (
                      <div className="flex items-center justify-between p-3 bg-[#1E1E1E] rounded-lg">
                        <span className="text-white">YouTube</span>
                        <Button
                          variant="outline"
                          className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                          onClick={disconnectYouTube}
                          disabled={ytLoading}
                          size="sm"
                        >
                          {ytLoading ? "Disconnecting..." : "Disconnect"}
                        </Button>
                      </div>
                    )}
                  </div>

                  <p className="text-white/60 text-sm mb-6">
                    Make sure you're logged into the account you want to connect
                    before clicking below.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <Button className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-bold hover:opacity-90 hover:scale-105 transition-transform">
                      Connect Instagram
                    </Button>
                    {ytConnected ? (
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white font-bold hover:scale-105 transition-transform"
                        disabled={ytLoading}
                      >
                        ✓ YouTube Connected
                      </Button>
                    ) : (
                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white font-bold hover:scale-105 transition-transform"
                        onClick={handleYouTubeOAuth}
                        disabled={ytLoading}
                      >
                        {ytLoading ? "Connecting..." : "Connect YouTube"}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="border-[#6E42E1] text-[#6E42E1] hover:bg-[#6E42E1] hover:text-white hover:scale-105 transition-transform"
                    >
                      + Other Platforms
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Channel Manager Section */}
            {activeTab === "Channel Manager" && (
              <div className="bg-gradient-to-br from-[#1E1E1E] to-[#2A2A2A] border border-[#3A3A3A] rounded-2xl p-4 md:p-8 shadow-2xl flex flex-col h-full">
                <div className="flex-1 flex flex-col">
                  <h3 className="text-white text-xl font-semibold mb-2 flex items-center gap-2">
                    <ChannelIcon />
                    Channel Management
                  </h3>
                  <p className="text-white/60 text-sm mb-6">
                    Organize your social media accounts into channels for better
                    content management
                  </p>

                  <div className="space-y-4 w-full">
                    <div>
                      <label className="block text-white/80 mb-2 text-sm font-medium">
                        Channel Name
                      </label>
                      <Input
                        placeholder="Enter a descriptive channel name"
                        className="w-full bg-[#2A2A2A] border-[#3A3A3A] text-white placeholder:text-white/40 h-12 focus:border-[#6E42E1]"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 mb-2 text-sm font-medium">
                        Description (Optional)
                      </label>
                      <Textarea
                        placeholder="Describe the purpose of this channel"
                        className="w-full bg-[#2A2A2A] border-[#3A3A3A] text-white placeholder:text-white/40 resize-none focus:border-[#6E42E1]"
                        rows={3}
                      />
                    </div>
                    <Button className="w-full bg-gradient-to-r from-[#6E42E1] to-[#8B5CF6] hover:from-[#7d55e6] hover:to-[#9c76ff] text-white px-6 py-4 md:px-8 md:py-6 text-base md:text-lg font-semibold hover:scale-105 transition-transform">
                      Create Channel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Password Management Section */}
            {activeTab === "Password Management" && (
              <div className="bg-gradient-to-br from-[#1E1E1E] to-[#2A2A2A] border border-[#3A3A3A] rounded-2xl p-4 md:p-8 shadow-2xl flex flex-col h-full">
                <div className="space-y-6 flex-1 flex flex-col">
                  <h3 className="text-white text-xl font-semibold mb-2 flex items-center gap-2">
                    <PasswordIcon />
                    Password Security
                  </h3>

                  <form
                    className="space-y-6 w-full"
                    onSubmit={handlePasswordUpdate}
                    autoComplete="off"
                  >
                    <div className="space-y-4">
                      <div>
                        <label
                          className="block text-white/80 mb-2 text-sm font-medium"
                          htmlFor="current-password"
                        >
                          Current Password
                        </label>
                        <div className="relative">
                          <Input
                            id="current-password"
                            type={showCurrent ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full bg-[#2A2A2A] border-[#3A3A3A] text-white h-12 pr-12 focus:border-[#6E42E1]"
                            autoComplete="current-password"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                            tabIndex={-1}
                            onClick={() => setShowCurrent((v) => !v)}
                            aria-label={
                              showCurrent ? "Hide password" : "Show password"
                            }
                          >
                            <EyeIcon open={showCurrent} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label
                          className="block text-white/80 mb-2 text-sm font-medium"
                          htmlFor="new-password"
                        >
                          New Password
                        </label>
                        <div className="relative">
                          <Input
                            id="new-password"
                            type={showNew ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-[#2A2A2A] border-[#3A3A3A] text-white h-12 pr-12 focus:border-[#6E42E1]"
                            autoComplete="new-password"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                            tabIndex={-1}
                            onClick={() => setShowNew((v) => !v)}
                            aria-label={
                              showNew ? "Hide password" : "Show password"
                            }
                          >
                            <EyeIcon open={showNew} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label
                          className="block text-white/80 mb-2 text-sm font-medium"
                          htmlFor="confirm-password"
                        >
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Input
                            id="confirm-password"
                            type={showConfirm ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-[#2A2A2A] border-[#3A3A3A] text-white h-12 pr-12 focus:border-[#6E42E1]"
                            autoComplete="new-password"
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                            tabIndex={-1}
                            onClick={() => setShowConfirm((v) => !v)}
                            aria-label={
                              showConfirm ? "Hide password" : "Show password"
                            }
                          >
                            <EyeIcon open={showConfirm} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Password Strength Indicator */}
                    {newPassword && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-white/60">
                          <span>Password Strength</span>
                          <span
                            className={
                              newPassword.length >= 8
                                ? "text-green-400"
                                : "text-yellow-400"
                            }
                          >
                            {newPassword.length >= 8 ? "Strong" : "Weak"}
                          </span>
                        </div>
                        <div className="w-full bg-[#2A2A2A] rounded-full h-2">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              newPassword.length >= 8
                                ? "bg-green-500"
                                : "bg-yellow-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                (newPassword.length / 8) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Status Messages */}
                    {passwordError && (
                      <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                        {passwordError}
                      </div>
                    )}
                    {passwordSuccess && (
                      <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
                        {passwordSuccess}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#6E42E1] to-[#8B5CF6] hover:from-[#7d55e6] hover:to-[#9c76ff] text-white py-4 md:py-6 text-base md:text-lg font-semibold hover:scale-105 transition-transform"
                      disabled={passwordLoading}
                    >
                      {passwordLoading
                        ? "Updating Password..."
                        : "Update Password"}
                    </Button>
                  </form>
                </div>
              </div>
            )}

            {/* Account Section */}
            {activeTab === "Account" && (
              <div className="bg-gradient-to-br from-[#1E1E1E] to-[#2A2A2A] border border-[#3A3A3A] rounded-2xl p-4 md:p-8 shadow-2xl flex flex-col h-full">
                <div className="space-y-6 flex-1 flex flex-col">
                  <h3 className="text-white text-xl font-semibold mb-2 flex items-center gap-2">
                    <AccountIcon />
                    Account Information
                  </h3>

                  <div className="space-y-4">
                    <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl p-4 md:p-6">
                      <div className="space-y-4">
                        {user?.username && (
                          <div>
                            <span className="block text-sm text-white/60 mb-2">
                              Username
                            </span>
                            <div className="text-lg font-medium text-white bg-[#1E1E1E] px-4 py-3 rounded-lg border border-[#3A3A3A]">
                              {user.username}
                            </div>
                          </div>
                        )}
                        <div>
                          <span className="block text-sm text-white/60 mb-2">
                            Email Address
                          </span>
                          <div className="text-lg font-medium text-white bg-gradient-to-r from-[#6E42E1]/20 to-[#8B5CF6]/20 px-4 py-3 rounded-lg border border-[#6E42E1]/30">
                            {user?.email || "Not available"}
                          </div>
                        </div>
                        <div>
                          <span className="block text-sm text-white/60 mb-2">
                            Account Status
                          </span>
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            Active
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 md:py-6 text-base md:text-lg font-semibold hover:scale-105 transition-transform flex items-center justify-center gap-2"
                      onClick={handleLogout}
                    >
                      <LogoutIcon />
                      Logout of Account
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
