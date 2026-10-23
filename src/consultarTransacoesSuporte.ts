
import { supabase } from './lib/supabase'

export type TransacaoSuporte = {
  id: string
  tipo: string
  valor: number
  criada_em: string
  conta_origem: number
  conta_destino: number | null
}

type ResultadoConsultaSuporte = {
  sucesso: boolean
  transacoes: TransacaoSuporte[]
  mensagem: string
}

export async function consultarTransacoesSuporte(
  busca: string,
): Promise<ResultadoConsultaSuporte> {
  const termo = busca.trim()

  if (!termo) {
    return {
      sucesso: false,
      transacoes: [],
      mensagem: 'Informe o ID da transação ou o número da conta.',
    }
  }

  try {
    const { data, error } = await supabase.rpc(
      'consultar_transacoes_suporte',
      {
        p_busca: termo,
      },
    )

    if (error) {
      console.error('Erro ao consultar transações de suporte:', error)

      return {
        sucesso: false,
        transacoes: [],
        mensagem: error.message.includes('suporte autorizado')
          ? 'Acesso permitido somente ao suporte autorizado.'
          : error.message.includes('não autenticado')
            ? 'Você precisa entrar na sua conta para continuar.'
            : 'Não foi possível consultar as transações.',
      }
    }

    return {
      sucesso: true,
      transacoes: (data ?? []) as TransacaoSuporte[],
      mensagem: data?.length
        ? 'Consulta realizada com sucesso.'
        : 'Nenhuma transação foi encontrada.',
    }
  } catch (error) {
    console.error('Erro inesperado na consulta de suporte:', error)

    return {
      sucesso: false,
      transacoes: [],
      mensagem: 'Não foi possível conectar ao banco de dados.',
    }
  }
}
