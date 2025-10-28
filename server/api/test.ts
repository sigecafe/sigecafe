export default defineEventHandler(async (event) => {
  try {
    console.log('Test endpoint called')
    console.log('Environment:', process.env.NODE_ENV)
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('AUTH_SECRET exists:', !!process.env.AUTH_SECRET)
    console.log('BASE_URL:', process.env.BASE_URL)
    
    return {
      success: true,
      message: 'API funcionando!',
      env: {
        hasDatabase: !!process.env.DATABASE_URL,
        hasAuthSecret: !!process.env.AUTH_SECRET,
        baseUrl: process.env.BASE_URL
      }
    }
  } catch (error: any) {
    console.error('Test endpoint error:', error)
    return {
      success: false,
      error: error.message,
      stack: error.stack
    }
  }
})

