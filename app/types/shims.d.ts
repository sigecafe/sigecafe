// Module declarations for .vue and third-party libs without types
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Vee-Validate has no types by default
declare module 'vee-validate'