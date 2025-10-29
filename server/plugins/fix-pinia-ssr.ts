/**
 * Fix para Pinia SSR - obj.hasOwnProperty is not a function
 * Patch no Object.prototype para garantir hasOwnProperty em todos os objetos
 */
export default defineNitroPlugin(() => {
  if (process.server) {
    // Guardar referência original
    const originalHasOwnProperty = Object.prototype.hasOwnProperty
    
    // Patch do devalue stringify para corrigir objetos antes de serializar
    const Module = require('module')
    const originalRequire = Module.prototype.require
    
    Module.prototype.require = function(id: string) {
      const module = originalRequire.apply(this, arguments)
      
      // Interceptar o módulo devalue
      if (id === 'devalue' || id.includes('devalue')) {
        const originalStringify = module.stringify
        
        if (originalStringify) {
          module.stringify = function(value: any, reducers?: any) {
            // Função para adicionar hasOwnProperty recursivamente
            function ensureHasOwnProperty(obj: any, visited = new WeakSet()): any {
              if (!obj || typeof obj !== 'object' || visited.has(obj)) {
                return obj
              }
              
              visited.add(obj)
              
              // Adicionar hasOwnProperty se não existir
              if (!obj.hasOwnProperty || typeof obj.hasOwnProperty !== 'function') {
                try {
                  Object.defineProperty(obj, 'hasOwnProperty', {
                    value: function(prop: string) {
                      return originalHasOwnProperty.call(this, prop)
                    },
                    enumerable: false,
                    writable: true,
                    configurable: true
                  })
                } catch (e) {
                  // Ignorar erros
                }
              }
              
              // Processar arrays
              if (Array.isArray(obj)) {
                obj.forEach((item: any) => ensureHasOwnProperty(item, visited))
                return obj
              }
              
              // Processar objetos
              try {
                const keys = Object.keys(obj)
                for (const key of keys) {
                  if (obj[key] && typeof obj[key] === 'object') {
                    ensureHasOwnProperty(obj[key], visited)
                  }
                }
              } catch (e) {
                // Ignorar erros durante iteração
              }
              
              return obj
            }
            
            // Corrigir o valor antes de stringify
            try {
              ensureHasOwnProperty(value)
            } catch (e) {
              console.warn('Error ensuring hasOwnProperty:', e)
            }
            
            return originalStringify.call(this, value, reducers)
          }
        }
      }
      
      return module
    }
  }
})
