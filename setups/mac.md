# Mac Setup

## [Homebrew](https://brew.sh/)

```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
echo >> $HOME/.zprofile
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> $HOME/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

## [Aerospace](https://github.com/nikitabobko/AeroSpace)

```sh
brew install --cask nikitabobko/tap/aerospace
```

## [NVM](https://github.com/nvm-sh/nvm)

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" 

nvm install 22.18.0
nvm use 22.18.0
```

## [Setting up SSH Key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)

```sh
ssh-keygen -t ed25519 -C "{REPLACE_ME}"
```

## Git Config

```sh
git config --global user.name "David Garibay"
git config --global user.email "me@davidgaribay.dev"
```

## [usql](https://github.com/xo/usql)

```sh
brew install xo/xo/usql
```

## [Github CLI](https://cli.github.com/)

```sh
brew install gh
```

## [PNPM](https://pnpm.io/installation)

```sh
npm install -g pnpm@latest-10
```

## [Bun](https://bun.com/)

```sh
curl -fsSL https://bun.sh/install | bash
```

## [Astral](https://docs.astral.sh/uv/)

```sh
curl -LsSf https://astral.sh/uv/install.sh | sh
```

## [Claude Code](https://www.claude.com/product/claude-code)

```sh
curl -fsSL https://claude.ai/install.sh | bash
```