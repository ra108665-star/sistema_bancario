
import { supabase } from './lib/supabase'

type ResultadoSaldo =
  | {
      sucesso: true
      numero: string
      saldo: number
      mensagem: string
    }
  | {
      sucesso: false
      mensagem: string
    }

export async function consultarSaldo(): Promise<ResultadoSaldo> {
  const { data: usuarioData, error: usuarioError } =
    await supabase.auth.getUser()

  if (usuarioError || !usuarioData.user) {
    return {
      sucesso: false,
      mensagem: 'Você precisa entrar na sua conta para consultar o saldo.',
    }
  }

  const { data, error } = await supabase
    .from('contas')
    .select('numero, saldo')
    .eq('titular_id', usuarioData.user.id)
    .maybeSingle()

  if (error) {
    return {
      sucesso: false,
      mensagem: 'Não foi possível consultar o saldo. Tente novamente.',
    }
  }

  if (!data) {
    return {
      sucesso: false,
      mensagem: 'Nenhuma conta foi encontrada para este usuário.',
    }
  }

  return {
    sucesso: true,
    numero: String(data.numero),
    saldo: Number(data.saldo),
    mensagem: 'Saldo consultado com sucesso.',
  }
}
