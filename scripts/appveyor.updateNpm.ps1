$ErrorActionPreference = 'Stop'

[Version] $npmVersion = npm --version
if ($npmVersion -lt '3.0') {
    npm install -g npm@^3
}
