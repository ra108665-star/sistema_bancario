
import { supabase } from './lib/supabase'

export async function autenticarUsuario(
  email: string,
  senha: string,
) {
  const emailValidado = email.trim()

  if (!emailValidado || !senha) {
    return {
      sucesso: false,
      mensagem: 'Preencha o e-mail e a senha.',
    }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailValidado,
    password: senha,
  })

  if (error) {
    return {
      sucesso: false,
      mensagem: 'Não foi possível entrar. Verifique suas credenciais e se o e-mail foi confirmado.',
    }
  }

  return {
    sucesso: true,
    mensagem: `Login realizado com sucesso. Bem-vindo, ${data.user.email ?? 'usuário'}!`,
  }
}
