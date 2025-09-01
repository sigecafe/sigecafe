import { defineStore } from "pinia";
import { useUsuarioStore } from "~/stores/UserStore";

interface UserPreferences {
  theme?: "light" | "dark" | "system";
  fontSize?: "small" | "medium" | "large";
}

export const useThemeToggleStore = defineStore("ThemeToggle", {
  state: () => ({
    preference: "system" as "light" | "dark" | "system",
    initialized: false
  }),

  actions: {
    async toggleTheme() {
      const userStore = useUsuarioStore();
      const colorMode = useColorMode();
      this.preference = colorMode.value === "dark" ? "light" : "dark";
      colorMode.preference = this.preference;

      // If user is authenticated, save preference to API
      if (this.initialized) {
        try {
          await userStore.updatePreferences({ theme: this.preference });
        } catch (error) {
          console.error('Error saving theme preference:', error);
        }
      }
    },

    async initTheme() {
      const colorMode = useColorMode();
      const userStore = useUsuarioStore();

      try {
        // Fetch stored preferences from user profile
        const prefs = await userStore.fetchUsuarioPreferences();
        if (prefs && prefs.theme) {
          this.preference = prefs.theme as "light" | "dark" | "system";
          colorMode.preference = this.preference;
        } else {
          // Fallback to browser preference
          this.preference = colorMode.preference as "light" | "dark" | "system";
          this.preference = ["light", "dark", "system"].includes(colorMode.preference)
            ? (colorMode.preference as "light" | "dark" | "system")
            : "system";
        }
      } catch (error) {
        // If error fetching preferences, use browser preference
        this.preference = colorMode.preference as "light" | "dark" | "system";
        this.preference = ["light", "dark", "system"].includes(colorMode.preference)
          ? (colorMode.preference as "light" | "dark" | "system")
          : "system";
      }

      this.initialized = true;
    },
  }
});
