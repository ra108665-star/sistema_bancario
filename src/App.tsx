
import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import './App.css'
import { cadastrarUsuario } from './cadastrarUsuario'
import { autenticarUsuario } from './autenticarUsuario'
import { consultarSaldo } from './consultarSaldo'
import { realizarSaque } from './realizarSaque'
import { realizarTransferencia } from './realizarTransferencia'
import {
  consultarHistorico,
  type TransacaoHistorico,
} from './consultarHistorico'
import {
  consultarTransacoesSuporte,
  type TransacaoSuporte,
} from './consultarTransacoesSuporte'
import { supabase } from './lib/supabase'

type Page =
  | 'dashboard'
  | 'register'
  | 'login'
  | 'balance'
  | 'withdraw'
  | 'transfer'
  | 'history'
  | 'support'

const navigation: { id: Page; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Início', icon: '⌂' },
  { id: 'register', label: 'Cadastrar usuário', icon: '＋' },
  { id: 'login', label: 'Autenticar usuário', icon: '⇥' },
  { id: 'balance', label: 'Consultar saldo', icon: '＄' },
  { id: 'withdraw', label: 'Realizar saque', icon: '↗' },
  { id: 'transfer', label: 'Transferência', icon: '⇄' },
  { id: 'history', label: 'Histórico', icon: '◷' },
  { id: 'support', label: 'Suporte', icon: '◎' },
]

function App() {
  const [page, setPage] = useState<Page>('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)

  const currentPage = navigation.find((item) => item.id === page)

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-icon">M</div>
          <div>
            <strong>Moneta</strong>
            <span>Banco digital</span>
          </div>
        </div>

        <div className="nav-label">MENU PRINCIPAL</div>

        <nav className="navigation">
          {navigation.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => {
                setPage(item.id)
                setMenuOpen(false)
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="status-dot" />
          <span>Ambiente de desenvolvimento</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Alternar menu"
          >
            ☰
          </button>

          <div className="breadcrumb">
            <span>Moneta</span>
            <span className="breadcrumb-separator">/</span>
            <strong>{currentPage?.label ?? 'Início'}</strong>
          </div>

          <div className="environment-badge">
            <span className="status-dot" />
            Protótipo
          </div>
        </header>

        <section className="page-content">
          {page === 'dashboard' && (
            <>
              <div className="welcome-section">
                <div>
                  <span className="eyebrow">VISÃO GERAL</span>
                  <h1>Bem-vindo ao Moneta.</h1>
                  <p>Seu sistema bancário em um só lugar.</p>
                </div>

                <div className="welcome-symbol" aria-hidden="true">
                  M
                </div>
              </div>

              <div className="notice">
                <span className="notice-icon">i</span>
                <div>
                  <strong>Ambiente de desenvolvimento</strong>
                  <p>
                    O cadastro, a autenticação, a consulta de saldo e
                    as operações de saque e transferência estão
                    integrados ao Supabase. Valide as operações antes
                    de utilizar o sistema em produção.
                  </p>
                </div>
              </div>

              <div className="section-heading">
                <div>
                  <h2>Acesso rápido</h2>
                  <p>Selecione uma funcionalidade para continuar.</p>
                </div>
              </div>

              <div className="feature-grid">
                <FeatureCard
                  icon="＋"
                  title="Criar cadastro"
                  description="Inicie o cadastro de um cliente."
                  onClick={() => setPage('register')}
                />

                <FeatureCard
                  icon="⇥"
                  title="Entrar na conta"
                  description="Acesse sua conta com suas credenciais."
                  onClick={() => setPage('login')}
                />

                <FeatureCard
                  icon="＄"
                  title="Consultar saldo"
                  description="Consulte o saldo disponível."
                  onClick={() => setPage('balance')}
                />

                <FeatureCard
                  icon="⇄"
                  title="Transferir"
                  description="Transfira valores para outra conta."
                  onClick={() => setPage('transfer')}
                />

                <FeatureCard
                  icon="↗"
                  title="Realizar saque"
                  description="Solicite um saque da sua conta."
                  onClick={() => setPage('withdraw')}
                />

                <FeatureCard
                  icon="◷"
                  title="Histórico"
                  description="Consulte suas movimentações."
                  onClick={() => setPage('history')}
                />
              </div>
            </>
          )}

          {page === 'register' && <RegisterForm />}

          {page === 'login' && <LoginForm />}

          {page === 'balance' && (
            <BalancePanel onGoToLogin={() => setPage('login')} />
          )}

          {page === 'withdraw' && (
            <WithdrawPanel
              onGoToLogin={() => setPage('login')}
              onGoToBalance={() => setPage('balance')}
            />
          )}

          {page === 'transfer' && (
            <TransferPanel
              onGoToLogin={() => setPage('login')}
              onGoToBalance={() => setPage('balance')}
            />
          )}

          {page === 'history' && (
            <HistoryPanel
              onGoToLogin={() => setPage('login')}
            />
          )}

          {page === 'support' && <SupportPanel />}
        </section>
      </main>
    </div>
  )
}

function TransferPanel({
  onGoToLogin,
  onGoToBalance,
}: {
  onGoToLogin: () => void
  onGoToBalance: () => void
}) {
  const [numeroDestino, setNumeroDestino] = useState('')
  const [valor, setValor] = useState('')
  const [transferenciaPendente, setTransferenciaPendente] = useState<{
    numeroDestino: string
    valor: number
  } | null>(null)
  const [mensagem, setMensagem] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [saldoFinal, setSaldoFinal] = useState<number | null>(null)
  const [transacaoId, setTransacaoId] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMensagem('')
    setSucesso(false)
    setSaldoFinal(null)
    setTransacaoId(null)

    const destino = numeroDestino.trim()
    const valorNumerico = Number(valor.trim().replace(',', '.'))

    if (
      !/^\d+$/.test(destino) ||
      !Number.isSafeInteger(Number(destino)) ||
      Number(destino) <= 0
    ) {
      setMensagem('Informe um número de conta de destino válido.')
      return
    }

    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      setMensagem('Informe um valor de transferência maior que zero.')
      return
    }

    if (Math.round(valorNumerico * 100) !== valorNumerico * 100) {
      setMensagem('Informe um valor com no máximo duas casas decimais.')
      return
    }

    setTransferenciaPendente({
      numeroDestino: destino,
      valor: valorNumerico,
    })
  }

  async function confirmarTransferencia() {
    if (transferenciaPendente === null || carregando) return

    setCarregando(true)
    setMensagem('')
    setSucesso(false)

    try {
      const resultado = await realizarTransferencia(
        transferenciaPendente.numeroDestino,
        transferenciaPendente.valor,
      )

      setMensagem(resultado.mensagem)
      setSucesso(resultado.sucesso)

      if (resultado.sucesso) {
        setSaldoFinal(resultado.saldo ?? null)
        setTransacaoId(resultado.transacao_id ?? null)
        setNumeroDestino('')
        setValor('')
        setTransferenciaPendente(null)
      }
    } catch {
      setMensagem(
        'Não foi possível conectar ao serviço de transferência.',
      )
      setSucesso(false)
    } finally {
      setCarregando(false)
    }
  }

  function cancelarTransferencia() {
    if (carregando) return

    setTransferenciaPendente(null)
    setMensagem('')
    setSucesso(false)
  }

  const valorFormatado =
    transferenciaPendente === null
      ? ''
      : transferenciaPendente.valor.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })

  const saldoFormatado =
    saldoFinal === null
      ? ''
      : saldoFinal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })

  return (
    <FormPanel
      eyebrow="UC-005"
      title="Realizar transferência"
      description="Informe a conta de destino e o valor que deseja transferir."
    >
      <div className="register-form">
        {transferenciaPendente === null ? (
          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="transferencia-destino">
                Número da conta de destino
              </label>
              <input
                id="transferencia-destino"
                name="numeroDestino"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="Ex.: 100002"
                value={numeroDestino}
                onChange={(event) => setNumeroDestino(event.target.value)}
                required
                disabled={carregando}
              />
            </div>

            <div className="form-field">
              <label htmlFor="transferencia-valor">
                Valor da transferência (R$)
              </label>
              <input
                id="transferencia-valor"
                name="valor"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="Ex.: 30,00"
                value={valor}
                onChange={(event) => setValor(event.target.value)}
                required
                disabled={carregando}
              />
            </div>

            <p className="placeholder-message">
              Confira o número da conta. A transferência só será
              realizada após sua confirmação.
            </p>

            <button
              className="submit-button"
              type="submit"
              disabled={carregando}
            >
              Continuar
            </button>
          </form>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">⇄</span>
            <strong>Confirme sua transferência</strong>
            <p>
              Conta de destino: {transferenciaPendente.numeroDestino}
            </p>
            <p>Valor solicitado: {valorFormatado}</p>
            <p>Deseja confirmar esta operação?</p>

            <button
              className="submit-button"
              type="button"
              onClick={() => void confirmarTransferencia()}
              disabled={carregando}
            >
              {carregando
                ? 'Processando...'
                : 'Confirmar transferência'}
            </button>

            <button
              className="submit-button"
              type="button"
              onClick={cancelarTransferencia}
              disabled={carregando}
            >
              Cancelar
            </button>
          </div>
        )}

        {mensagem && (
          <div
            className={`form-feedback ${
              sucesso ? 'feedback-success' : 'feedback-error'
            }`}
            role={sucesso ? 'status' : 'alert'}
          >
            {mensagem}
          </div>
        )}

        {sucesso && (
          <div className="empty-state">
            <strong>Transferência concluída</strong>

            {saldoFinal !== null && (
              <p>Saldo após a transferência: {saldoFormatado}</p>
            )}

            {transacaoId && (
              <p>Identificador da transação: {transacaoId}</p>
            )}

            <button
              className="submit-button"
              type="button"
              onClick={onGoToBalance}
            >
              Consultar saldo
            </button>
          </div>
        )}

        {!sucesso &&
          mensagem.toLowerCase().includes('entre na sua conta') && (
            <button
              className="submit-button"
              type="button"
              onClick={onGoToLogin}
            >
              Ir para o login
            </button>
          )}
      </div>
    </FormPanel>
  )
}

function WithdrawPanel({
  onGoToLogin,
  onGoToBalance,
}: {
  onGoToLogin: () => void
  onGoToBalance: () => void
}) {
  const [valor, setValor] = useState('')
  const [valorPendente, setValorPendente] = useState<number | null>(null)
  const [mensagem, setMensagem] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [saldoFinal, setSaldoFinal] = useState<number | null>(null)
  const [transacaoId, setTransacaoId] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMensagem('')
    setSucesso(false)
    setSaldoFinal(null)
    setTransacaoId(null)

    const valorNumerico = Number(valor.trim().replace(',', '.'))

    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      setMensagem('Informe um valor de saque maior que zero.')
      return
    }

    if (Math.round(valorNumerico * 100) !== valorNumerico * 100) {
      setMensagem('Informe um valor com no máximo duas casas decimais.')
      return
    }

    setValorPendente(valorNumerico)
  }

  async function confirmarSaque() {
    if (valorPendente === null || carregando) return

    setCarregando(true)
    setMensagem('')
    setSucesso(false)

    try {
      const resultado = await realizarSaque(valorPendente)

      setMensagem(resultado.mensagem)
      setSucesso(resultado.sucesso)

      if (resultado.sucesso) {
        setSaldoFinal(resultado.saldo ?? null)
        setTransacaoId(resultado.transacao_id ?? null)
        setValor('')
        setValorPendente(null)
      }
    } catch {
      setMensagem('Não foi possível conectar ao serviço de saque.')
      setSucesso(false)
    } finally {
      setCarregando(false)
    }
  }

  function cancelarSaque() {
    if (carregando) return

    setValorPendente(null)
    setMensagem('')
    setSucesso(false)
  }

  const valorFormatado =
    valorPendente === null
      ? ''
      : valorPendente.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })

  const saldoFormatado =
    saldoFinal === null
      ? ''
      : saldoFinal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })

  return (
    <FormPanel
      eyebrow="UC-004"
      title="Realizar saque"
      description="Informe o valor que deseja retirar da sua conta."
    >
      <div className="register-form">
        {valorPendente === null ? (
          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="saque-valor">Valor do saque (R$)</label>
              <input
                id="saque-valor"
                name="valor"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="Ex.: 50,00"
                value={valor}
                onChange={(event) => setValor(event.target.value)}
                required
                disabled={carregando}
              />
            </div>

            <p className="placeholder-message">
              O saque só será realizado depois da sua confirmação.
            </p>

            <button
              className="submit-button"
              type="submit"
              disabled={carregando}
            >
              Continuar
            </button>
          </form>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">↗</span>
            <strong>Confirme seu saque</strong>
            <p>Valor solicitado: {valorFormatado}</p>
            <p>Deseja confirmar esta operação?</p>

            <button
              className="submit-button"
              type="button"
              onClick={() => void confirmarSaque()}
              disabled={carregando}
            >
              {carregando ? 'Processando...' : 'Confirmar saque'}
            </button>

            <button
              className="submit-button"
              type="button"
              onClick={cancelarSaque}
              disabled={carregando}
            >
              Cancelar
            </button>
          </div>
        )}

        {mensagem && (
          <div
            className={`form-feedback ${
              sucesso ? 'feedback-success' : 'feedback-error'
            }`}
            role={sucesso ? 'status' : 'alert'}
          >
            {mensagem}
          </div>
        )}

        {sucesso && (
          <div className="empty-state">
            <strong>Saque concluído</strong>

            {saldoFinal !== null && (
              <p>Saldo após o saque: {saldoFormatado}</p>
            )}

            {transacaoId && (
              <p>Identificador da transação: {transacaoId}</p>
            )}

            <button
              className="submit-button"
              type="button"
              onClick={onGoToBalance}
            >
              Consultar saldo
            </button>
          </div>
        )}

        {!sucesso &&
          mensagem.toLowerCase().includes('entre na sua conta') && (
            <button
              className="submit-button"
              type="button"
              onClick={onGoToLogin}
            >
              Ir para o login
            </button>
          )}
      </div>
    </FormPanel>
  )
}

function HistoryPanel({
  onGoToLogin,
}: {
  onGoToLogin: () => void
}) {
  const [numeroConta, setNumeroConta] = useState<string | null>(null)
  const [contaId, setContaId] = useState<string | null>(null)
  const [transacoes, setTransacoes] = useState<TransacaoHistorico[]>([])
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(true)

  async function carregarHistorico() {
    setCarregando(true)
    setMensagem('')
    setNumeroConta(null)
    setContaId(null)
    setTransacoes([])

    try {
      const resultado = await consultarHistorico()

      if (!resultado.sucesso) {
        setMensagem(resultado.mensagem)
        return
      }

      const { data: usuarioData, error: usuarioError } =
        await supabase.auth.getUser()

      if (usuarioError || !usuarioData.user) {
        setMensagem(
          'Você precisa entrar na sua conta para consultar o histórico.',
        )
        return
      }

      const { data: conta, error: contaError } = await supabase
        .from('contas')
        .select('id')
        .eq('titular_id', usuarioData.user.id)
        .maybeSingle()

      if (contaError || !conta) {
        setMensagem('Não foi possível localizar sua conta.')
        return
      }

      setNumeroConta(resultado.numeroConta)
      setContaId(conta.id)
      setTransacoes(resultado.transacoes)
    } catch {
      setMensagem('Não foi possível conectar ao banco de dados.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    void carregarHistorico()
  }, [])

  function formatarData(data: string) {
    return new Date(data).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  }

  function formatarValor(valor: number) {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  return (
    <FormPanel
      eyebrow="UC-006"
      title="Histórico de transações"
      description="Consulte as movimentações vinculadas à sua conta."
    >
      {carregando ? (
        <div className="empty-state">
          <strong>Carregando histórico...</strong>
          <p>Aguarde enquanto buscamos suas transações.</p>
        </div>
      ) : mensagem ? (
        <div className="register-form">
          <div className="form-feedback feedback-error" role="alert">
            {mensagem}
          </div>

          {mensagem.includes('precisa entrar') ? (
            <button
              type="button"
              className="submit-button"
              onClick={onGoToLogin}
            >
              Ir para o login
            </button>
          ) : (
            <button
              type="button"
              className="submit-button"
              onClick={() => void carregarHistorico()}
            >
              Tentar novamente
            </button>
          )}
        </div>
      ) : (
        <div className="register-form">
          <div className="empty-state">
            <span className="empty-icon">◷</span>
            <p>Conta nº {numeroConta}</p>
            <strong>
              {transacoes.length === 0
                ? 'Nenhuma movimentação encontrada'
                : `${transacoes.length} movimentação(ões)`}
            </strong>
            <p>
              As transações mais recentes aparecem primeiro.
            </p>
          </div>

          {transacoes.length > 0 && (
            <div className="history-list">
              {transacoes.map((transacao) => {
                const recebida =
                  transacao.tipo === 'transferencia' &&
                  transacao.conta_destino_id === contaId

                const titulo =
                  transacao.tipo === 'saque'
                    ? 'Saque'
                    : recebida
                      ? 'Transferência recebida'
                      : 'Transferência enviada'

                const valorExibido =
                  recebida
                    ? `+ ${formatarValor(transacao.valor)}`
                    : `− ${formatarValor(transacao.valor)}`

                return (
                  <article
                    className="history-item"
                    key={transacao.id}
                  >
                    <div>
                      <strong>{titulo}</strong>
                      <p>{formatarData(transacao.criada_em)}</p>
                      <small>
                        Transação: {transacao.id}
                      </small>
                    </div>

                    <strong
                      className={
                        recebida
                          ? 'history-value-in'
                          : 'history-value-out'
                      }
                    >
                      {valorExibido}
                    </strong>
                  </article>
                )
              })}
            </div>
          )}

          <button
            type="button"
            className="submit-button"
            onClick={() => void carregarHistorico()}
          >
            Atualizar histórico
          </button>
        </div>
      )}
    </FormPanel>
  )
}


function SupportPanel() {
  const [busca, setBusca] = useState('')
  const [transacoes, setTransacoes] = useState<TransacaoSuporte[]>([])
  const [mensagem, setMensagem] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [pesquisou, setPesquisou] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMensagem('')
    setSucesso(false)
    setTransacoes([])
    setPesquisou(false)

    const termo = busca.trim()

    if (!termo) {
      setMensagem('Informe o ID da transação ou o número da conta.')
      return
    }

    setCarregando(true)

    try {
      const resultado = await consultarTransacoesSuporte(termo)

      setMensagem(resultado.mensagem)
      setSucesso(resultado.sucesso)
      setTransacoes(resultado.transacoes)
      setPesquisou(true)
    } catch {
      setMensagem('Não foi possível consultar as transações.')
      setSucesso(false)
    } finally {
      setCarregando(false)
    }
  }

  function formatarData(data: string) {
    return new Date(data).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  }

  function formatarValor(valor: number) {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  return (
    <FormPanel
      eyebrow="UC-007"
      title="Consulta para suporte"
      description="Pesquise transações pelo identificador da transação ou pelo número de uma conta. A consulta é restrita aos operadores autorizados."
    >
      <div className="register-form">
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="suporte-busca">
              ID da transação ou número da conta
            </label>
            <input
              id="suporte-busca"
              name="busca"
              type="text"
              autoComplete="off"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Cole o ID ou informe o número da conta"
              required
              disabled={carregando}
            />
          </div>

          <button
            className="submit-button"
            type="submit"
            disabled={carregando}
          >
            {carregando ? 'Pesquisando...' : 'Pesquisar transações'}
          </button>
        </form>

        {mensagem && (
          <div
            className={`form-feedback ${
              sucesso ? 'feedback-success' : 'feedback-error'
            }`}
            role={sucesso ? 'status' : 'alert'}
          >
            {mensagem}
          </div>
        )}

        {sucesso && transacoes.length > 0 && (
          <div className="history-list">
            {transacoes.map((transacao) => (
              <article className="history-item" key={transacao.id}>
                <div>
                  <strong>
                    {transacao.tipo === 'saque'
                      ? 'Saque'
                      : 'Transferência'}
                  </strong>
                  <p>Data: {formatarData(transacao.criada_em)}</p>
                  <small>ID: {transacao.id}</small>
                  <p>Conta de origem: {transacao.conta_origem}</p>
                  {transacao.conta_destino !== null && (
                    <p>Conta de destino: {transacao.conta_destino}</p>
                  )}
                </div>

                <strong className="history-value-out">
                  {formatarValor(transacao.valor)}
                </strong>
              </article>
            ))}
          </div>
        )}

        {pesquisou && sucesso && transacoes.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">⌕</span>
            <strong>Nenhuma transação encontrada</strong>
            <p>
              Confira o identificador ou o número da conta e tente novamente.
            </p>
          </div>
        )}
      </div>
    </FormPanel>
  )
}

function BalancePanel({
  onGoToLogin,
}: {
  onGoToLogin: () => void
}) {
  const [saldo, setSaldo] = useState<number | null>(null)
  const [numero, setNumero] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(true)

  async function carregarSaldo() {
    setCarregando(true)
    setMensagem('')
    setSaldo(null)
    setNumero(null)

    try {
      const resultado = await consultarSaldo()

      if (!resultado.sucesso) {
        setMensagem(resultado.mensagem)
        return
      }

      setSaldo(resultado.saldo)
      setNumero(resultado.numero)
    } catch {
      setMensagem('Não foi possível conectar ao banco de dados.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    void carregarSaldo()
  }, [])

  const saldoFormatado =
    saldo === null
      ? ''
      : saldo.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })

  return (
    <FormPanel
      eyebrow="UC-003"
      title="Consultar saldo"
      description="Consulte o saldo da sua conta autenticada."
    >
      {carregando ? (
        <div className="empty-state">
          <strong>Consultando saldo...</strong>
          <p>Aguarde enquanto buscamos os dados da sua conta.</p>
        </div>
      ) : saldo !== null ? (
        <div className="register-form">
          <div className="empty-state">
            <span className="empty-icon">＄</span>
            <p>Conta nº {numero}</p>
            <strong>Saldo disponível</strong>
            <h2>{saldoFormatado}</h2>
          </div>

          <button
            type="button"
            className="submit-button"
            onClick={() => void carregarSaldo()}
          >
            Atualizar saldo
          </button>
        </div>
      ) : (
        <div className="register-form">
          <div className="form-feedback feedback-error" role="alert">
            {mensagem}
          </div>

          {mensagem.includes('precisa entrar') ? (
            <button
              type="button"
              className="submit-button"
              onClick={onGoToLogin}
            >
              Ir para o login
            </button>
          ) : (
            <button
              type="button"
              className="submit-button"
              onClick={() => void carregarSaldo()}
            >
              Tentar novamente
            </button>
          )}
        </div>
      )}
    </FormPanel>
  )
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [usuario, setUsuario] = useState<string | null>(null)
  const [verificandoSessao, setVerificandoSessao] = useState(true)

  useEffect(() => {
    let ativo = true

    async function verificarSessao() {
      const { data, error } = await supabase.auth.getSession()

      if (!ativo) return

      if (error) {
        setMensagem('Não foi possível verificar a sessão atual.')
      } else {
        setUsuario(data.session?.user.email ?? null)
      }

      setVerificandoSessao(false)
    }

    void verificarSessao()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_evento, session) => {
        if (ativo) {
          setUsuario(session?.user.email ?? null)
        }
      },
    )

    return () => {
      ativo = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMensagem('')
    setSucesso(false)
    setCarregando(true)

    try {
      const resultado = await autenticarUsuario(email, senha)

      setMensagem(resultado.mensagem)
      setSucesso(resultado.sucesso)

      if (resultado.sucesso) {
        setSenha('')
      }
    } catch {
      setMensagem(
        'Não foi possível conectar ao serviço de autenticação.',
      )
    } finally {
      setCarregando(false)
    }
  }

  async function handleLogout() {
    setMensagem('')
    setSucesso(false)
    setCarregando(true)

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        setMensagem('Não foi possível encerrar a sessão.')
        return
      }

      setSenha('')
      setMensagem('Sessão encerrada com sucesso.')
      setSucesso(true)
    } catch {
      setMensagem(
        'Não foi possível conectar ao serviço de autenticação.',
      )
    } finally {
      setCarregando(false)
    }
  }

  if (verificandoSessao) {
    return (
      <FormPanel
        eyebrow="UC-002"
        title="Autenticar usuário"
        description="Verificando a sessão atual..."
      >
        <p className="placeholder-message">Aguarde um momento.</p>
      </FormPanel>
    )
  }

  return (
    <FormPanel
      eyebrow="UC-002"
      title="Autenticar usuário"
      description="Entre com o e-mail e a senha utilizados no cadastro."
    >
      {usuario ? (
        <div className="register-form">
          <div className="form-feedback feedback-success" role="status">
            Você está autenticado como <strong>{usuario}</strong>.
          </div>

          <button
            type="button"
            className="submit-button"
            onClick={handleLogout}
            disabled={carregando}
          >
            {carregando ? 'Encerrando sessão...' : 'Encerrar sessão'}
          </button>
        </div>
      ) : (
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="login-email">E-mail</label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@exemplo.com"
              required
              disabled={carregando}
            />
          </div>

          <div className="form-field">
            <label htmlFor="login-senha">Senha</label>
            <input
              id="login-senha"
              name="senha"
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              placeholder="Digite sua senha"
              required
              disabled={carregando}
            />
          </div>

          <button
            className="submit-button"
            type="submit"
            disabled={carregando}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      )}

      {mensagem && (
        <p
          className={`form-feedback ${
            sucesso ? 'feedback-success' : 'feedback-error'
          }`}
          role={sucesso ? 'status' : 'alert'}
        >
          {mensagem}
        </p>
      )}
    </FormPanel>
  )
}

function RegisterForm() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMensagem('')
    setSucesso(false)

    if (senha !== confirmacao) {
      setMensagem('As senhas não coincidem.')
      return
    }

    setCarregando(true)

    try {
      const resultado = await cadastrarUsuario(nome, email, senha)

      setMensagem(resultado.mensagem)
      setSucesso(resultado.sucesso)

      if (resultado.sucesso) {
        setNome('')
        setEmail('')
        setSenha('')
        setConfirmacao('')
      }
    } catch {
      setMensagem(
        'Não foi possível concluir o cadastro. Verifique a conexão e tente novamente.',
      )
    } finally {
      setCarregando(false)
    }
  }

  return (
    <FormPanel
      eyebrow="UC-001"
      title="Cadastrar usuário"
      description="Preencha os dados para criar seu cadastro."
    >
      <form className="register-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="nome">Nome completo</label>
          <input
            id="nome"
            name="nome"
            type="text"
            autoComplete="name"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            placeholder="Digite seu nome"
            required
            maxLength={120}
            disabled={carregando}
          />
        </div>

        <div className="form-field">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@exemplo.com"
            required
            disabled={carregando}
          />
        </div>

        <div className="form-field">
          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            name="senha"
            type="password"
            autoComplete="new-password"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            placeholder="Mínimo de 6 caracteres"
            minLength={6}
            required
            disabled={carregando}
          />
        </div>

        <div className="form-field">
          <label htmlFor="confirmacao">Confirmar senha</label>
          <input
            id="confirmacao"
            name="confirmacao"
            type="password"
            autoComplete="new-password"
            value={confirmacao}
            onChange={(event) => setConfirmacao(event.target.value)}
            placeholder="Digite a senha novamente"
            minLength={6}
            required
            disabled={carregando}
          />
        </div>

        {mensagem && (
          <div
            className={`form-feedback ${
              sucesso ? 'feedback-success' : 'feedback-error'
            }`}
            role={sucesso ? 'status' : 'alert'}
          >
            {mensagem}
          </div>
        )}

        <button
          className="submit-button"
          type="submit"
          disabled={carregando}
        >
          {carregando ? 'Cadastrando...' : 'Criar cadastro'}
        </button>
      </form>
    </FormPanel>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: string
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button className="feature-card" onClick={onClick}>
      <span className="feature-icon">{icon}</span>
      <span className="feature-title">{title}</span>
      <span className="feature-description">{description}</span>
      <span className="feature-arrow">→</span>
    </button>
  )
}

function FormPanel({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="form-panel">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p className="page-description">{description}</p>
      <div className="panel-body">{children}</div>
    </div>
  )
}

export default App
