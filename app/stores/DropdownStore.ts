import { defineStore } from "pinia";
import type { Usuario, UsuarioType } from "@prisma/client";

interface DropdownState {
  permissions: any[];
  selectedRows: number;
  isEditing: boolean;
  modalState: boolean;
  editingRowIndex: number | null;
  newPermission: {
    id: number | null;
    path: string;
    usuarioType: UsuarioType[];
  };
}

export const useDropdownStore = defineStore("Dropdown", {
  state: (): DropdownState => ({
    permissions: [],
    selectedRows: 0,
    isEditing: false,
    modalState: false,
    editingRowIndex: null,
    newPermission: {
      id: null,
      path: "",
      usuarioType: [],
    },
  }),

  actions: {
    async fetch() {
      try {
        const response = await $fetch<any[]>('/api/permissoes/dropdown', {
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
        const response = await $fetch('/api/permissoes/dropdown', {
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
        const response = await $fetch('/api/permissoes/dropdown', {
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

    async remove(permission: any) {
      try {
        await $fetch('/api/permissoes/dropdown', {
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
      };
    },

    setEditingPermission(permission: any) {
      this.isEditing = true;
      this.newPermission = { ...permission };
      this.editingRowIndex = this.permissions.findIndex((p) => p.id === permission.id);
      this.modalState = true;
    },
  },
});
