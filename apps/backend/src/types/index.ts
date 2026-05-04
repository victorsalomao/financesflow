declare module 'fastify' {
  interface FastifyRequest {
    usuario: {
      authId: string
      token: string
    }
  }
}

export {}
