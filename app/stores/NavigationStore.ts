import { defineStore } from "pinia";
import type { MenuType } from "@prisma/client";
import type { PermissionDTO } from "~/types/api";

interface NavigationState {
  pages: PermissionDTO[];
}

export const useNavigationStore = defineStore("navigation", {
  state: (): NavigationState => ({
    pages: [],
  }),

  actions: {
    movePagesToStart(pages: PermissionDTO[], priorityPaths: string[]) {
      const result = [...pages];

      // Process paths in reverse to maintain correct order
      for (const path of [...priorityPaths].reverse()) {
        const index = result.findIndex((p) => p.path === path);
        if (index !== -1) {
          const [page] = result.splice(index, 1);
          result.unshift(page as PermissionDTO);
        }
      }

      return result;
    },

    async fetchPages() {
      try {
        const allPagesFetched = await $fetch<PermissionDTO[]>("/api/navigation", {
          credentials: "include",
        });

        if (allPagesFetched && allPagesFetched.length > 0) {
          const sortedPages = [...allPagesFetched];
          sortedPages.sort((a, b) => (a.title || "").localeCompare(b.title || ""));

          this.pages = this.movePagesToStart(sortedPages, ["/app", "/app/perfil"]);
        } else {
          console.error("No pages found or data is null");
        }
      } catch (error) {
        console.error("Error fetching pages:", error);
      }
    },

    filterPages(menuType?: MenuType) {
      if (menuType) {
        return this.pages.filter((page) => page.menuType?.includes(menuType));
      } else {
        const route = useRoute();
        const hasPerfil = route.path.includes("/app/perfil");
        if (hasPerfil) {
          return this.pages.filter((page) => page.menuType?.includes("PERFIL"));
        } else {
          return this.pages.filter((page) => page.menuType?.includes("ROOT"));
        }
      }
    },

    navigateTo(path: string) {
      navigateTo(path);
    },
  },
});
