export function ok<T>(dados: T, mensagem = 'Operação realizada com sucesso') {
  return { sucesso: true, dados, mensagem }
}

export function erro(mensagem: string) {
  return { sucesso: false, dados: null, mensagem }
}
