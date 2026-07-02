# Access — cofre local de acessos (NÃO COMMITAR)

> Copie este arquivo para **`access.md`** e preencha. O `access.md` está no
> `.gitignore` e **nunca** é enviado ao git.
>
> **Uso:** o orquestrador e os agentes (`@e2e`, `@security`) leem daqui para
> **acessar e testar as aplicações** — logins de teste, tokens, SSH, URLs.
>
> **Regras:** nunca cole valores em prompts, logs ou commits. Ao exibir, mascare
> (`ghp_****`). Este arquivo é para **testes/desenvolvimento**, não para produção.

---

## Aplicações (URLs)

| App | Ambiente | URL |
|-----|----------|-----|
| <app> | local | http://localhost:<porta> |
| <app> | staging | |
| <app> | produção | |

## Logins de teste

| App | Papel | Usuário / e-mail | Senha |
|-----|-------|------------------|-------|
| <app> | admin | | |
| <app> | user | | |

## Tokens / API keys

| Serviço | Escopo | Token |
|---------|--------|-------|
| GitHub | repo | |
| <serviço> | | |

## SSH

| Host | Usuário | Chave / caminho | Notas |
|------|---------|-----------------|-------|
| | | ~/.ssh/id_ed25519 | |

## Banco de dados

| App | Ambiente | Connection string |
|-----|----------|-------------------|
| <app> | local | |

## Outros acessos

| O quê | Onde | Credencial |
|-------|------|------------|
| | | |
