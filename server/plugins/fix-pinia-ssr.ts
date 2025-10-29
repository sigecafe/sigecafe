/**
 * Fix para Pinia SSR - obj.hasOwnProperty is not a function
 * Garante que todos os objetos tenham hasOwnProperty durante a serialização
 */
export default defineNitroPlugin((nitroApp) => {
  if (process.server) {
    // Intercepta a renderização para normalizar objetos antes da serialização
    nitroApp.hooks.hook('render:response', (response, { event }) => {
      // Função recursiva para adicionar hasOwnProperty
      function fixObject(obj: any): any {
        if (!obj || typeof obj !== 'object') return obj
        
        if (Array.isArray(obj)) {
          return obj.map(fixObject)
        }
        
        // Adicionar hasOwnProperty se não existir
        if (typeof obj.hasOwnProperty !== 'function') {
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
        
        // Processar propriedades
        for (const key in obj) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            obj[key] = fixObject(obj[key])
          }
        }
        
        return obj
      }
      
      // Tentar corrigir o body da resposta se for objeto
      if (response.body && typeof response.body === 'object') {
        try {
          fixObject(response.body)
        } catch (e) {
          console.warn('Error fixing Pinia SSR object:', e)
        }
      }
    })
  }
})

