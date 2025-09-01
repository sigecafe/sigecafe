import { defineStore } from "pinia";
import { nextTick } from "vue";
import type { SignupDTO, AuthResponseDTO } from "~/types/api";
import { formatPhoneNumber, getPhoneDigits } from "~/utils/phoneUtils";

// Add type definitions
type FormType = "auth" | "signup";
type StepType = "name" | "celular" | "password";

interface AuthState {
  name: string;
  celular: string;
  password: string;
  loading: boolean;
  error: string;
  step: StepType;
  formType: FormType;
}

export const useAuthStore = defineStore("Auth", {
  state: (): AuthState => ({
    name: "",
    celular: "",
    password: "",
    loading: false,
    error: "",
    step: "name",
    formType: "auth",
  }),

  actions: {
    setError(message: string) {
      this.error = message;
    },

    clearError() {
      this.error = "";
    },

    setLoading(value: boolean) {
      this.loading = value;
    },

    resetForm() {
      this.name = "";
      this.celular = "";
      this.password = "";
      this.error = "";
      this.loading = false;
      this.step = "name";
    },

    setFormType(type: FormType) {
      this.resetForm();
      this.formType = type;
      this.step = type === "auth" ? "celular" : "name";
    },

    async handleSignup() {
      try {
        const signupData: SignupDTO = {
          name: this.name,
          celular: getPhoneDigits(this.celular), // Use utility function
          password: this.password,
        };

        const response = await $fetch<AuthResponseDTO>("/api/auth/signup", {
          method: "POST",
          body: signupData,
        });

        if (response.success) {
          const { signIn } = useAuth();
          const result = await signIn("credentials", {
            redirect: false,
            celular: signupData.celular,
            password: this.password,
          });

          if (result?.error) {
            throw new Error(result.error);
          }

          return navigateTo("/app");
        }

        if (response.errorCode === "USER_EXISTS") {
          this.setError(
            'Número de celular já cadastrado, <a href="/auth/login" class="login-link">clique aqui para fazer login</a>'
          );
        } else {
          this.setError("Problema ao cadastrar tente novamente mais tarde");
        }
      } catch (e) {
        this.setError("Problema ao cadastrar tente novamente mais tarde");
      } finally {
        this.resetForm();
      }
    },

    async handleLogin() {
      try {
        // Extract only the digits for authentication using utility function
        const celularDigits = getPhoneDigits(this.celular);

        const { signIn } = useAuth();
        const result = await signIn("credentials", {
          redirect: false,
          celular: celularDigits, // Send only digits
          password: this.password,
        });

        if (result?.error) {
          throw new Error(result.error);
        }
        return navigateTo("/app");
      } catch (e) {
        this.setError("Número de celular ou senha inválidos");
        this.step = "celular";
        this.celular = "";
        this.password = "";
        this.loading = false;
      }
    },

    maskPhoneNumber(event?: InputEvent) {
      // This method is now just a wrapper around the utility function
      if (event?.target) {
        // Store original value
        const input = event?.target as HTMLInputElement;
        // Apply new formatting
        const digitsOnly = getPhoneDigits(input.value);
        this.celular = formatPhoneNumber(digitsOnly);
      }
    },

    async validateAndProceed(event: Event) {
      event.preventDefault();
      this.clearError();

      if (this.formType === "signup" && this.step === "name") {
        if (!this.name.trim()) {
          this.setError("Nome não pode ser vazio");
          return;
        }
        this.setLoading(true);
        await nextTick();
        setTimeout(() => {
          this.step = "celular";
          this.setLoading(false);
        }, 500);
      } else if (this.step === "celular") {
        const phoneDigits = getPhoneDigits(this.celular);

        if (!phoneDigits || phoneDigits.length !== 11) {
          this.setError("Digite um número de celular válido com 11 dígitos");
          return;
        }

        // Ensure we're using only the correctly formatted value
        this.celular = formatPhoneNumber(phoneDigits);

        this.setLoading(true);
        await nextTick();
        setTimeout(() => {
          this.step = "password";
          this.setLoading(false);
        }, 500);
      } else if (this.step === "password") {
        if (!this.password.trim()) {
          this.setError("Senha não pode ser vazia");
          return;
        }
        this.setLoading(true);
        // Call appropriate handler based on form type
        if (this.formType === "auth") {
          await this.handleLogin();
        } else {
          await this.handleSignup();
        }
      }
    }
  }
});
