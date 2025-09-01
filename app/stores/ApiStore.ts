import { defineStore } from "pinia";
import type { UsuarioType } from "@prisma/client";
import type { PermissionDTO } from "~/types/api";

interface ApiState {
  permissions: PermissionDTO[];
  selectedRows: number;
  isEditing: boolean;
  modalState: boolean;
  editingRowIndex: number | null;
  newPermission: {
    id: number | null;
    path: string;
    usuarioType: UsuarioType[];
    title?: string | null;
    icon?: string | null;
    description?: string | null;
    menuType?: any[];
  };
}

export const useApiStore = defineStore("Api", {
  state: (): ApiState => ({
    permissions: [],
    selectedRows: 0,
    isEditing: false,
    modalState: false,
    editingRowIndex: null,
    newPermission: {
      id: null,
      path: "",
      usuarioType: [],
      title: null,
      icon: null,
      description: null,
      menuType: []
    },
  }),

  actions: {
    async fetch() {
      try {
        const response = await $fetch<PermissionDTO[]>('/api/permissoes/api', {
          credentials: "include"
        });
        this.permissions = response;
      } catch (error) {
        console.error("Error fetching permissions:", error);
        throw error;
      }
    },

    async create() {
      try {
        const response = await $fetch<PermissionDTO>('/api/permissoes/api', {
          method: "POST",
          body: this.newPermission,
          credentials: "include"
        });
        this.permissions.push(response);
        this.resetForm();
      } catch (error) {
        console.error("Error creating permission:", error);
        throw error;
      }
    },

    async update() {
      try {
        const response = await $fetch<PermissionDTO>('/api/permissoes/api', {
          method: "PUT",
          body: this.newPermission,
          credentials: "include"
        });

        if (this.editingRowIndex !== null) {
          this.permissions[this.editingRowIndex] = response;
        }
        this.resetForm();
      } catch (error) {
        console.error("Error updating permission:", error);
        throw error;
      }
    },

    async remove(permission: PermissionDTO) {
      try {
        await $fetch('/api/permissoes/api', {
          method: "DELETE",
          body: { id: permission.id },
          credentials: "include"
        });

        const index = this.permissions.findIndex((p) => p.id === permission.id);
        if (index !== -1) {
          this.permissions.splice(index, 1);
        }
      } catch (error) {
        console.error("Error removing permission:", error);
        throw error;
      }
    },

    resetForm() {
      this.modalState = false;
      this.isEditing = false;
      this.editingRowIndex = null;
      this.newPermission = {
        id: null,
        path: "",
        usuarioType: [],
        title: null,
        icon: null,
        description: null,
        menuType: []
      };
    },

    setEditingPermission(permission: PermissionDTO) {
      this.isEditing = true;
      this.newPermission = {
        id: permission.id,
        path: permission.path,
        title: permission.title,
        icon: permission.icon,
        description: permission.description,
        usuarioType: permission.usuarioType,
        menuType: permission.menuType
      };
      this.editingRowIndex = this.permissions.findIndex((p) => p.id === permission.id);
      this.modalState = true;
    },
  },
});
