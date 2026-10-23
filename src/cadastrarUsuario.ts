
import { supabase } from './lib/supabase'

export async function cadastrarUsuario(
  nome: string,
  email: string,
  senha: string,
) {
  const nomeValidado = nome.trim()
  const emailValidado = email.trim()

  if (!nomeValidado || !emailValidado || !senha) {
    return {
      sucesso: false,
      mensagem: 'Preencha todos os campos.',
    }
  }

  if (senha.length < 6) {
    return {
      sucesso: false,
      mensagem: 'A senha deve ter pelo menos 6 caracteres.',
    }
  }

  const { data, error } = await supabase.auth.signUp({
    email: emailValidado,
    password: senha,
    options: {
      data: {
        nome: nomeValidado,
      },
    },
  })

  if (error) {
    return {
      sucesso: false,
      mensagem: error.message,
    }
  }

  if (data.user && !data.session) {
    return {
      sucesso: true,
      mensagem:
        'Cadastro recebido! Verifique seu e-mail para confirmar a conta.',
    }
  }

  return {
    sucesso: true,
    mensagem: 'Cadastro realizado com sucesso!',
  }
}
