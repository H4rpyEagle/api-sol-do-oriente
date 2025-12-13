# Como fazer upload no GitHub

## 1. Configurar Git (se ainda não configurou)

Configure seu nome e email do Git (substitua pelos seus dados):

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@example.com"
```

Ou configure apenas para este repositório:

```bash
git config user.name "Seu Nome"
git config user.email "seu.email@example.com"
```

## 2. Criar repositório no GitHub

1. Acesse https://github.com
2. Clique em "New repository" (ou vá em https://github.com/new)
3. Nome do repositório: `api-sol-do-oriente` (ou outro nome de sua preferência)
4. Deixe como **privado** (recomendado, pois contém configurações sensíveis)
5. **NÃO** marque "Initialize with README" (já temos arquivos)
6. Clique em "Create repository"

## 3. Conectar repositório local ao GitHub

Após criar o repositório no GitHub, você verá instruções. Execute estes comandos:

```bash
# Adicionar o remote (substitua SEU_USUARIO pelo seu usuário do GitHub)
git remote add origin https://github.com/SEU_USUARIO/api-sol-do-oriente.git

# Ou se preferir usar SSH:
# git remote add origin git@github.com:SEU_USUARIO/api-sol-do-oriente.git

# Verificar se foi adicionado corretamente
git remote -v
```

## 4. Fazer commit inicial

```bash
# Configurar Git (se ainda não fez)
git config user.name "Seu Nome"
git config user.email "seu.email@example.com"

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Initial commit: API Sol do Oriente - Processamento de mensagens WhatsApp"
```

## 5. Fazer push para o GitHub

```bash
# Enviar para o GitHub (branch main)
git branch -M main
git push -u origin main
```

Se pedir credenciais:
- **Username**: Seu usuário do GitHub
- **Password**: Use um **Personal Access Token** (não sua senha)
  - Como criar: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token
  - Permissões necessárias: `repo`

## 6. Verificar

Acesse seu repositório no GitHub e verifique se todos os arquivos foram enviados.

## ⚠️ Importante

- O arquivo `.env` está no `.gitignore` e **NÃO** será enviado (isso é correto!)
- O arquivo `env.example.txt` será enviado (isso é correto!)
- Nunca commite arquivos `.env` com credenciais reais

## Comandos úteis

```bash
# Ver status dos arquivos
git status

# Ver histórico de commits
git log

# Ver branches
git branch

# Fazer push de commits futuros
git add .
git commit -m "Descrição da mudança"
git push
```

