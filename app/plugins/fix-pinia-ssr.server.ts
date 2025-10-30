/**
 * Fix Pinia SSR - obj.hasOwnProperty is not a function
 * Patch em JSON.stringify para adicionar hasOwnProperty antes da serialização
 */
export default defineNuxtPlugin(() => {
  if (process.server) {
    const originalStringify = JSON.stringify
    
    // @ts-ignore
    JSON.stringify = function(value: any, replacer?: any, space?: any) {
      function ensureHasOwnProperty(obj: any, visited = new WeakSet()): void {
        if (!obj || typeof obj !== 'object' || visited.has(obj)) return
        visited.add(obj)
        
        // Adicionar hasOwnProperty se não existir
        if (!obj.hasOwnProperty || typeof obj.hasOwnProperty !== 'function') {
          try {
            Object.defineProperty(obj, 'hasOwnProperty', {
              value: function(prop: string) {
                return Object.prototype.hasOwnProperty.call(this, prop)
              },
              enumerable: false,
              writable: true,
              configurable: true
            })
          } catch (e) {
            // Ignorar erros
          }
        }
        
        // Processar recursivamente
        if (Array.isArray(obj)) {
          obj.forEach(item => ensureHasOwnProperty(item, visited))
        } else {
          try {
            Object.keys(obj).forEach(key => {
              if (obj[key] && typeof obj[key] === 'object') {
                ensureHasOwnProperty(obj[key], visited)
              }
            })
          } catch (e) {
            // Ignorar erros
          }
        }
      }
      
      // Corrigir objetos antes de serializar
      if (value && typeof value === 'object') {
        try {
          ensureHasOwnProperty(value)
        } catch (e) {
          console.warn('[Pinia SSR Fix] Error:', e)
        }
      }
      
      return originalStringify.call(this, value, replacer, space)
    }
  }
})

