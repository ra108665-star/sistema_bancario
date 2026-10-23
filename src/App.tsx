
import { useState } from 'react'
import './App.css'

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
                <div className="welcome-symbol" aria-hidden="true">M</div>
              </div>

              <div className="notice">
                <span className="notice-icon">i</span>
                <div>
                  <strong>Ambiente de desenvolvimento</strong>
                  <p>
                    A interface está pronta para a integração. Nenhuma operação
                    financeira é executada nesta etapa.
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
                  description="Acesse a funcionalidade de transferência."
                  onClick={() => setPage('transfer')}
                />
                <FeatureCard
                  icon="↗"
                  title="Realizar saque"
                  description="Acesse a funcionalidade de saque."
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

          {page === 'register' && (
            <FormPanel
              eyebrow="UC-001"
              title="Cadastrar usuário"
              description="Preencha os dados para iniciar seu cadastro."
            >
              <p className="placeholder-message">
                O formulário será conectado ao Supabase Auth na próxima etapa.
              </p>
            </FormPanel>
          )}

          {page === 'login' && (
            <FormPanel
              eyebrow="UC-002"
              title="Autenticar usuário"
              description="Entre para acessar as funcionalidades protegidas."
            >
              <p className="placeholder-message">
                A autenticação será implementada com Supabase Auth.
              </p>
            </FormPanel>
          )}

          {page === 'balance' && (
            <FormPanel
              eyebrow="UC-003"
              title="Consultar saldo"
              description="Consulte o saldo da sua conta autenticada."
            >
              <div className="empty-state">
                <span className="empty-icon">＄</span>
                <strong>Saldo indisponível</strong>
                <p>Entre na sua conta para consultar o saldo.</p>
              </div>
            </FormPanel>
          )}

          {page === 'withdraw' && (
            <FormPanel
              eyebrow="UC-004"
              title="Realizar saque"
              description="Informe o valor que deseja retirar da sua conta."
            >
              <p className="placeholder-message">
                O saque será habilitado após a implementação das validações
                e da operação atômica no banco de dados.
              </p>
            </FormPanel>
          )}

          {page === 'transfer' && (
            <FormPanel
              eyebrow="UC-005"
              title="Realizar transferência"
              description="Transfira valores para outra conta válida."
            >
              <p className="placeholder-message">
                A transferência será habilitada após a implementação da
                validação das contas e da operação atômica.
              </p>
            </FormPanel>
          )}

          {page === 'history' && (
            <FormPanel
              eyebrow="UC-006"
              title="Histórico de transações"
              description="Consulte as movimentações da sua conta."
            >
              <div className="empty-state">
                <span className="empty-icon">◷</span>
                <strong>Nenhuma movimentação carregada</strong>
                <p>O histórico aparecerá aqui após a integração com o banco.</p>
              </div>
            </FormPanel>
          )}

          {page === 'support' && (
            <FormPanel
              eyebrow="UC-007"
              title="Consulta para suporte"
              description="Localize uma transação para auxiliar no atendimento."
            >
              <p className="placeholder-message">
                Esta funcionalidade será restrita aos operadores autorizados.
              </p>
            </FormPanel>
          )}
        </section>
      </main>
    </div>
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
  children: React.ReactNode
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
