
import { supabase } from './lib/supabase'

type ResultadoTransferencia = {
  sucesso: boolean
  mensagem: string
  saldo?: number
  transacao_id?: string
}

export async function realizarTransferencia(
  numeroDestino: string,
  valor: number,
): Promise<ResultadoTransferencia> {
  const numeroValidado = numeroDestino.trim()

  if (!numeroValidado || !/^\d+$/.test(numeroValidado)) {
    return {
      sucesso: false,
      mensagem: 'Informe um número de conta de destino válido.',
    }
  }

  if (!Number.isSafeInteger(Number(numeroValidado)) ||
      Number(numeroValidado) <= 0) {
    return {
      sucesso: false,
      mensagem: 'O número da conta de destino é inválido.',
    }
  }

  if (!Number.isFinite(valor) || valor <= 0) {
    return {
      sucesso: false,
      mensagem: 'Informe um valor maior que zero.',
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
      mensagem: 'Entre na sua conta para realizar uma transferência.',
    }
  }

  const { data, error } = await supabase.rpc(
    'realizar_transferencia',
    {
      p_numero_destino: numeroValidado,
      p_valor: valor,
    },
  )

  if (error) {
    const mensagem = error.message.toLowerCase()

    if (mensagem.includes('saldo insuficiente')) {
      return {
        sucesso: false,
        mensagem: 'Saldo insuficiente para realizar a transferência.',
      }
    }

    if (mensagem.includes('não autenticado')) {
      return {
        sucesso: false,
        mensagem: 'Sua sessão expirou. Entre novamente.',
      }
    }

    if (mensagem.includes('destino não encontrada')) {
      return {
        sucesso: false,
        mensagem: 'A conta de destino não foi encontrada.',
      }
    }

    if (mensagem.includes('diferente da conta de origem')) {
      return {
        sucesso: false,
        mensagem: 'Você não pode transferir para sua própria conta.',
      }
    }

    return {
      sucesso: false,
      mensagem: 'Não foi possível realizar a transferência. Tente novamente.',
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
    mensagem: resultado.mensagem ?? 'Transferência processada.',
    saldo: resultado.saldo,
    transacao_id: resultado.transacao_id,
  }
}
