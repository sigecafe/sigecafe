import { defineStore } from "pinia";
import { useUsuarioStore } from "~/stores/UserStore";

export type FontSizePreference = "small" | "medium" | "large" | "xlarge";

interface UserPreferences {
  theme?: "light" | "dark" | "system";
  fontSize?: FontSizePreference;
}

export const useFontSizeStore = defineStore("FontSize", {
  state: () => ({
    preference: "medium" as FontSizePreference,
    initialized: false
  }),

  actions: {
    async setFontSize(size: FontSizePreference) {
      this.preference = size;
      this.applyFontSize();

      // Save to localStorage as fallback
      if (process.client) {
        localStorage.setItem("font-size-preference", size);
      }

      // If user is authenticated and initialized, save to API
      if (this.initialized) {
        try {
          const userStore = useUsuarioStore();
          await userStore.updatePreferences({ fontSize: size });
        } catch (error) {
          console.error('Error saving font size preference:', error);
        }
      }
    },

    cycleFontSize() {
      const sizes: FontSizePreference[] = ["small", "medium", "large", "xlarge"];
      const currentIndex = sizes.indexOf(this.preference);
      const nextIndex = (currentIndex + 1) % sizes.length;
      const nextSize = sizes[nextIndex] || "medium"; // Ensure a valid default
      this.setFontSize(nextSize);
    },

    applyFontSize() {
      if (process.client) {
        const html = document.documentElement;

        // Remove existing font size classes
        html.classList.remove("text-sm", "text-base", "text-lg", "text-xl");

        // Add the new font size class
        switch (this.preference) {
          case "small":
            html.classList.add("text-sm");
            break;
          case "medium":
            html.classList.add("text-base");
            break;
          case "large":
            html.classList.add("text-lg");
            break;
          case "xlarge":
            html.classList.add("text-xl");
            break;
        }
      }
    },

    async initFontSize() {
      const userStore = useUsuarioStore();
      try {
        // Fetch stored preferences from user profile
        const prefs = await userStore.fetchUsuarioPreferences();
        if (prefs && prefs.fontSize) {
          this.preference = prefs.fontSize as FontSizePreference;
        } else if (process.client) {
          // Fallback to localStorage
          const savedPreference = localStorage.getItem("font-size-preference") as FontSizePreference | null;
          if (savedPreference && ["small", "medium", "large", "xlarge"].includes(savedPreference)) {
            this.preference = savedPreference;
          }
        }
      } catch (error) {
        // If loading preferences fails, fallback to localStorage
        if (process.client) {
          const savedPreference = localStorage.getItem("font-size-preference") as FontSizePreference | null;
          if (savedPreference && ["small", "medium", "large", "xlarge"].includes(savedPreference)) {
            this.preference = savedPreference;
          }
        }
      } finally {
        this.applyFontSize();
        this.initialized = true;
      }
    },
  }
});