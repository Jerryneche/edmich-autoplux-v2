"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  UserIcon,
  PhoneIcon,
  AtSymbolIcon,
  LockClosedIcon,
  CameraIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    emailVerified: false,
    phone: "",
    username: "",
    password: "",
    image: "",
    role: "BUYER",
  });
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // First try NextAuth session
        if (status === "authenticated" && session?.user?.email) {
          const response = await fetch("/api/user/profile");
          if (response.ok) {
            const data = await response.json();
            setUserData({
              name: data.name || "",
              email: data.email || "",
              emailVerified: !!data.emailVerified,
              phone: data.phone || "",
              username: data.username || "",
              password: data.hasPassword ? "set" : "",
              image: data.image || "",
              role: data.role || "BUYER",
            });
          }
        } else if (status === "unauthenticated") {
          // No session, redirect to login
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to fetch user data");
      }
    };

    fetchUserData();
  }, [session, status, router]);

  // Calculate progress
  const calculateProgress = () => {
    let completed = 0;
    const total = 5;

    if (userData.emailVerified) completed++;
    if (userData.phone) completed++;
    if (userData.username) completed++;
    if (userData.password) completed++;
    if (userData.image) completed++;

    return Math.round((completed / total) * 100);
  };

  const progress = calculateProgress();

  const handleSkip = () => {
    // Redirect based on role
    switch (userData.role) {
      case "SUPPLIER":
        router.push("/onboarding/supplier");
        break;
      case "MECHANIC":
        router.push("/onboarding/mechanic");
        break;
      case "LOGISTICS":
        router.push("/onboarding/logistics");
        break;
      case "BUYER":
        router.push("/dashboard/buyer");
        break;
      default:
        router.push("/dashboard");
    }
  };

  const sections = [
    {
      id: "email",
      title: "Email Verification",
      subtitle: userData.email,
      completed: userData.emailVerified,
      icon: CheckCircleIcon,
      locked: true,
    },
    {
      id: "phone",
      title: "Phone Number",
      subtitle: userData.phone || "Add your phone number",
      completed: !!userData.phone,
      icon: PhoneIcon,
    },
    {
      id: "username",
      title: "Username",
      subtitle: userData.username || "Create a unique username",
      completed: !!userData.username,
      icon: AtSymbolIcon,
    },
    {
      id: "password",
      title: "Password",
      subtitle: userData.password ? "••••••••" : "Set a secure password",
      completed: !!userData.password,
      icon: LockClosedIcon,
    },
    {
      id: "photo",
      title: "Profile Photo",
      subtitle: userData.image ? "Photo uploaded" : "Add a profile picture",
      completed: !!userData.image,
      icon: CameraIcon,
    },
  ];

  // Show loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-gradient-to-b from-white via-neutral-50 to-white min-h-screen">
      <Toaster position="top-center" />
      <Header />

      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="relative max-w-2xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">
              Complete Your Profile
            </h1>
            <p className="text-neutral-600">
              Add more details to unlock all features
            </p>
          </div>

          {/* Progress Card */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">
                  Profile Completion
                </p>
                <p className="text-white text-4xl font-bold">{progress}%</p>
              </div>
              <div className="w-24 h-24 relative">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="white"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${
                      2 * Math.PI * 40 * (1 - progress / 100)
                    }`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircleIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <p className="text-white text-sm">
                {progress === 100
                  ? "🎉 Profile complete! You're all set."
                  : `${
                      5 - sections.filter((s) => s.completed).length
                    } more steps to complete`}
              </p>
            </div>
          </div>

          {/* Skip Button */}
          <div className="text-center mb-6">
            <button
              onClick={handleSkip}
              className="text-neutral-600 hover:text-neutral-900 font-medium text-sm inline-flex items-center gap-2"
            >
              <span>I'll do this later</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Sections List */}
          <div className="bg-white rounded-3xl shadow-xl border-2 border-neutral-200 overflow-hidden">
            {error && (
              <div className="p-4 bg-red-50 border-b border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {sections.map((section, index) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <div key={section.id}>
                  <button
                    onClick={() =>
                      !section.locked &&
                      setActiveSection(isActive ? null : section.id)
                    }
                    disabled={section.locked}
                    className={`w-full p-6 flex items-center gap-4 hover:bg-neutral-50 transition-all ${
                      index !== 0 ? "border-t border-neutral-100" : ""
                    } ${section.locked ? "cursor-default" : "cursor-pointer"}`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        section.completed ? "bg-green-100" : "bg-neutral-100"
                      }`}
                    >
                      {section.completed ? (
                        <CheckCircleIcon className="w-6 h-6 text-green-600" />
                      ) : (
                        <Icon className="w-6 h-6 text-neutral-600" />
                      )}
                    </div>

                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-neutral-900 mb-1">
                        {section.title}
                      </h3>
                      <p className="text-sm text-neutral-600">
                        {section.subtitle}
                      </p>
                    </div>

                    {!section.locked && (
                      <ArrowRightIcon
                        className={`w-5 h-5 text-neutral-400 transition-transform ${
                          isActive ? "rotate-90" : ""
                        }`}
                      />
                    )}
                  </button>

                  {/* Expandable Content */}
                  {isActive && (
                    <div className="px-6 pb-6 bg-neutral-50 border-t border-neutral-100">
                      {section.id === "phone" && (
                        <PhoneSection
                          userData={userData}
                          setUserData={setUserData}
                          setActiveSection={setActiveSection}
                          setError={setError}
                          isLoading={isLoading}
                          setIsLoading={setIsLoading}
                        />
                      )}
                      {section.id === "username" && (
                        <UsernameSection
                          userData={userData}
                          setUserData={setUserData}
                          setActiveSection={setActiveSection}
                          setError={setError}
                          isLoading={isLoading}
                          setIsLoading={setIsLoading}
                        />
                      )}
                      {section.id === "password" && (
                        <PasswordSection
                          userData={userData}
                          setUserData={setUserData}
                          setActiveSection={setActiveSection}
                          setError={setError}
                          isLoading={isLoading}
                          setIsLoading={setIsLoading}
                        />
                      )}
                      {section.id === "photo" && (
                        <PhotoSection
                          userData={userData}
                          setUserData={setUserData}
                          setActiveSection={setActiveSection}
                          setError={setError}
                          isLoading={isLoading}
                          setIsLoading={setIsLoading}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Complete Button */}
          {progress === 100 && (
            <div className="mt-8">
              <button
                onClick={handleSkip}
                className="w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-semibold hover:shadow-xl hover:scale-[1.02] transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

// Phone Section Component
function PhoneSection({
  userData,
  setUserData,
  setActiveSection,
  setError,
  isLoading,
  setIsLoading,
}: any) {
  const [phone, setPhone] = useState(userData.phone);

  const handleSave = async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/user/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Update failed");
        toast.error(data.error || "Update failed");
        return;
      }

      setUserData({ ...userData, phone });
      setActiveSection(null);
      toast.success("Phone number saved!");
    } catch (err) {
      setError("Something went wrong");
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-4 space-y-4">
      <div className="relative">
        <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+234 800 000 0000"
          className="w-full pl-12 pr-4 py-3 bg-white border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={isLoading || !phone}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? "Saving..." : "Save Phone Number"}
      </button>
    </div>
  );
}

// Username Section Component
function UsernameSection({
  userData,
  setUserData,
  setActiveSection,
  setError,
  isLoading,
  setIsLoading,
}: any) {
  const [username, setUsername] = useState(userData.username);

  const handleSave = async () => {
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      setError(
        "Username must be 3-20 characters (letters, numbers, underscore)"
      );
      toast.error("Invalid username format");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/user/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Update failed");
        toast.error(data.error || "Update failed");
        return;
      }

      setUserData({ ...userData, username });
      setActiveSection(null);
      toast.success("Username saved!");
    } catch (err) {
      setError("Something went wrong");
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-4 space-y-4">
      <div className="relative">
        <AtSymbolIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
        <input
          type="text"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
          }
          placeholder="johndoe"
          className="w-full pl-12 pr-4 py-3 bg-white border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
        />
      </div>
      <p className="text-xs text-neutral-500">
        3-20 characters, letters, numbers, and underscore only
      </p>
      <button
        onClick={handleSave}
        disabled={isLoading || !username || username.length < 3}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? "Saving..." : "Save Username"}
      </button>
    </div>
  );
}

// Password Section Component
function PasswordSection({
  userData,
  setUserData,
  setActiveSection,
  setError,
  isLoading,
  setIsLoading,
}: any) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSave = async () => {
    setLocalError("");
    setError("");

    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/user/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Update failed");
        toast.error(data.error || "Update failed");
        return;
      }

      setUserData({ ...userData, password: "set" });
      setActiveSection(null);
      toast.success("Password set successfully!");
    } catch (err) {
      setError("Something went wrong");
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-4 space-y-4">
      {localError && <p className="text-red-600 text-sm">{localError}</p>}
      <div className="relative">
        <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          className="w-full pl-12 pr-4 py-3 bg-white border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
        />
      </div>
      <div className="relative">
        <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
          className="w-full pl-12 pr-4 py-3 bg-white border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
        />
      </div>
      <p className="text-xs text-neutral-500">Must be at least 8 characters</p>
      <button
        onClick={handleSave}
        disabled={isLoading || !password || !confirmPassword}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? "Saving..." : "Set Password"}
      </button>
    </div>
  );
}

// Photo Section Component
function PhotoSection({
  userData,
  setUserData,
  setActiveSection,
  setError,
  isLoading,
  setIsLoading,
}: any) {
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File must be an image");
      toast.error("File must be an image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/user/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        toast.error("Upload failed");
        return;
      }

      const data = await response.json();
      setUserData({ ...userData, image: data.url });
      setActiveSection(null);
      toast.success("Photo uploaded!");
    } catch (err) {
      setError("Failed to upload image");
      toast.error("Failed to upload image");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-4 space-y-4">
      {userData.image ? (
        <div className="flex items-center gap-4">
          <img
            src={userData.image}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-semibold text-neutral-900">
              Photo uploaded
            </p>
            <label className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
              Change photo
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      ) : (
        <label className="block w-full p-8 border-2 border-dashed border-neutral-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
          <div className="text-center">
            <CameraIcon className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-neutral-900 mb-1">
              Upload a photo
            </p>
            <p className="text-xs text-neutral-500">PNG, JPG up to 5MB</p>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
