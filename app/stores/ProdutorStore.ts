import { defineStore } from "pinia";

interface Produtor {
  id: number;
  name: string;
  email: string | null;
  celular: string | null;
  cidade: string | null;
}

interface ProdutorState {
  produtores: Produtor[];
  selectedRows: number;
  isEditing: boolean;
  modalState: boolean;
  editingRowIndex: number | null;
  newProdutor: {
    id: number | null;
    name: string;
    email: string | null;
    celular: string | null;
    cidade: string | null;
  };
}

export const useProdutorStore = defineStore("Produtor", {
  state: (): ProdutorState => ({
    produtores: [],
    selectedRows: 0,
    isEditing: false,
    modalState: false,
    editingRowIndex: null,
    newProdutor: {
      id: null,
      name: "",
      email: "",
      celular: "",
      cidade: "",
    },
  }),

  actions: {
    async fetch() {
      try {
        // Mock data for now, replace with actual API call when available
        this.produtores = [
          { id: 1, name: "Produtor 1", email: "produtor1@example.com", celular: "(11) 9999-8881", cidade: "São Paulo" },
          { id: 2, name: "Produtor 2", email: "produtor2@example.com", celular: "(11) 9999-8882", cidade: "São Paulo" },
          { id: 3, name: "Produtor 3", email: "produtor3@example.com", celular: "(11) 9999-8883", cidade: "São Paulo" },
          { id: 4, name: "Produtor 4", email: "produtor4@example.com", celular: "(11) 9999-8884", cidade: "São Paulo" },
          { id: 5, name: "Produtor 5", email: "produtor5@example.com", celular: "(11) 9999-8885", cidade: "São Paulo" },
        ];

        // When API endpoint is available, uncomment this:
        /*
        const response = await $fetch<Produtor[]>(`/api/produtor`, {
          credentials: "include"
        });
        this.produtores = Array.isArray(response) ? response : [];
        */
      } catch (error) {
        console.error("Error fetching produtores:", error);
        this.produtores = [];
      }
    },

    async create() {
      try {
        // Mock creation for now, replace with actual API call when available
        const newId = Math.max(...this.produtores.map(p => p.id), 0) + 1;
        const newProdutor = {
          id: newId,
          name: this.newProdutor.name,
          email: this.newProdutor.email,
          celular: this.newProdutor.celular,
          cidade: this.newProdutor.cidade,
        };

        this.produtores.push(newProdutor);

        // When API endpoint is available, uncomment this:
        /*
        const response = await $fetch<Produtor>(`/api/produtor`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(this.newProdutor),
        });

        if (!Array.isArray(this.produtores)) {
          this.produtores = [];
        }

        if (response && typeof response === 'object' && 'id' in response) {
          this.produtores.push(response as Produtor);
        }
        */

        this.resetForm();
      } catch (error) {
        console.error("Error creating produtor:", error);
      }
    },

    async update() {
      try {
        // Mock update for now, replace with actual API call when available
        if (this.editingRowIndex !== null) {
          const updatedProdutor = {
            id: this.newProdutor.id as number,
            name: this.newProdutor.name,
            email: this.newProdutor.email,
            celular: this.newProdutor.celular,
            cidade: this.newProdutor.cidade,
          };

          this.produtores[this.editingRowIndex] = updatedProdutor;
        }

        // When API endpoint is available, uncomment this:
        /*
        const response = await $fetch<Produtor>(`/api/produtor`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(this.newProdutor),
        });

        if (!Array.isArray(this.produtores)) {
          this.produtores = [];
        }

        if (this.editingRowIndex !== null && response && typeof response === 'object' && 'id' in response) {
          this.produtores[this.editingRowIndex] = response as Produtor;
        }
        */

        this.resetForm();
      } catch (error) {
        console.error("Error updating produtor:", error);
      }
    },

    async remove(produtor: Produtor) {
      try {
        // Mock removal for now, replace with actual API call when available
        const index = this.produtores.findIndex((p) => p.id === produtor.id);
        if (index !== -1) {
          this.produtores.splice(index, 1);
        }

        // When API endpoint is available, uncomment this:
        /*
        await $fetch(`/api/produtor`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: { produtor },
          credentials: "include",
        });

        const index = this.produtores.findIndex((p) => p.id === produtor.id);
        if (index !== -1) {
          this.produtores.splice(index, 1);
        }
        */
      } catch (error) {
        console.error("Error removing produtor:", error);
      }
    },

    resetForm() {
      this.modalState = false;
      this.isEditing = false;
      this.editingRowIndex = null;
      this.newProdutor = {
        id: null,
        name: "",
        email: "",
        celular: "",
        cidade: "",
      };
    },

    setEditingProdutor(produtor: Produtor) {
      this.isEditing = true;
      this.newProdutor = {
        id: produtor.id,
        name: produtor.name,
        email: produtor.email,
        celular: produtor.celular,
        cidade: produtor.cidade,
      };
      this.editingRowIndex = this.produtores.findIndex((p) => p.id === produtor.id);
      this.modalState = true;
    },
  },
});