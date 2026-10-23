
import { supabase } from './lib/supabase'

export type TransacaoHistorico = {
  id: string
  tipo: 'saque' | 'transferencia'
  conta_origem_id: string
  conta_destino_id: string | null
  valor: number
  criada_em: string
}

type ResultadoHistorico =
  | {
      sucesso: true
      numeroConta: string
      transacoes: TransacaoHistorico[]
      mensagem: string
    }
  | {
      sucesso: false
      mensagem: string
    }

export async function consultarHistorico(): Promise<ResultadoHistorico> {
  const { data: usuarioData, error: usuarioError } =
    await supabase.auth.getUser()

  if (usuarioError || !usuarioData.user) {
    return {
      sucesso: false,
      mensagem: 'Você precisa entrar na sua conta para consultar o histórico.',
    }
  }

  const { data: conta, error: contaError } = await supabase
    .from('contas')
    .select('id, numero')
    .eq('titular_id', usuarioData.user.id)
    .maybeSingle()

  if (contaError) {
    return {
      sucesso: false,
      mensagem: 'Não foi possível localizar sua conta.',
    }
  }

  if (!conta) {
    return {
      sucesso: false,
      mensagem: 'Nenhuma conta foi encontrada para este usuário.',
    }
  }

  const { data, error } = await supabase
    .from('transacoes')
    .select(
      'id, tipo, conta_origem_id, conta_destino_id, valor, criada_em',
    )
    .or(
      `conta_origem_id.eq.${conta.id},conta_destino_id.eq.${conta.id}`,
    )
    .order('criada_em', { ascending: false })

  if (error) {
    return {
      sucesso: false,
      mensagem: 'Não foi possível carregar o histórico. Tente novamente.',
    }
  }

  const transacoes: TransacaoHistorico[] = (data ?? []).map((item) => ({
    id: item.id,
    tipo: item.tipo as 'saque' | 'transferencia',
    conta_origem_id: item.conta_origem_id,
    conta_destino_id: item.conta_destino_id,
    valor: Number(item.valor),
    criada_em: item.criada_em,
  }))

  return {
    sucesso: true,
    numeroConta: String(conta.numero),
    transacoes,
    mensagem: 'Histórico consultado com sucesso.',
  }
}
