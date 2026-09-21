export function errorHandler(err, req, res, next) {
  console.error('[Backend Error]:', err)
  const status = err.status || 500
  const message = err.message || 'Internal Server Error'
  return res.status(status).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })
}
