
import { supabase } from './lib/supabase'

type ResultadoSaque = {
  sucesso: boolean
  mensagem: string
  saldo?: number
  transacao_id?: string
}

export async function realizarSaque(
  valor: number,
): Promise<ResultadoSaque> {
  if (!Number.isFinite(valor) || valor <= 0) {
    return {
      sucesso: false,
      mensagem: 'Informe um valor de saque maior que zero.',
    }
  }

  if (Math.round(valor * 100) !== valor * 100) {
    return {
      sucesso: false,
      mensagem: 'Informe um valor com no máximo duas casas decimais.',
    }
  }

  const { data: usuarioData, error: usuarioError } =
    await supabase.auth.getUser()

  if (usuarioError || !usuarioData.user) {
    return {
      sucesso: false,
      mensagem: 'Entre na sua conta para realizar um saque.',
    }
  }

  const { data, error } = await supabase.rpc('realizar_saque', {
    p_valor: valor,
  })

  if (error) {
    const mensagem = error.message.toLowerCase()

    if (mensagem.includes('saldo insuficiente')) {
      return {
        sucesso: false,
        mensagem: 'Saldo insuficiente para realizar este saque.',
      }
    }

    if (mensagem.includes('não autenticado')) {
      return {
        sucesso: false,
        mensagem: 'Sua sessão expirou. Entre novamente.',
      }
    }

    return {
      sucesso: false,
      mensagem: 'Não foi possível realizar o saque. Tente novamente.',
    }
  }

  const resultado = data as {
    sucesso?: boolean
    mensagem?: string
    saldo?: number
    transacao_id?: string
  }

  return {
    sucesso: resultado.sucesso === true,
    mensagem: resultado.mensagem ?? 'Saque processado.',
    saldo: resultado.saldo,
    transacao_id: resultado.transacao_id,
  }
}
