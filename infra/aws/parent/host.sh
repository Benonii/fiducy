#!/usr/bin/env bash
# Runs on the parent EC2 host through SSM. Two steps:
#   host.sh build  -> install tools, build the apps and the enclave image, print its PCR0
#   host.sh start  -> (re)start Postgres, the control plane, the demo, the enclave and Caddy
#   host.sh rotate-token -> replace the gateway token; run build and start afterwards
# Required env: AWS_REGION, FIDUCY_BUCKET, FIDUCY_KMS_KEY_ID, FIDUCY_KEYS_TABLE, FIDUCY_PUBLIC_IP
# The demo runs only when the dashboard-created demo app's ID and secret sit in Parameter Store.
set -euo pipefail

STEP="${1:?usage: host.sh build|start|rotate-token}"
RELEASE_DIR=/opt/fiducy/release
STATE_DIR=/var/lib/fiducy
SECRETS_FILE=/etc/fiducy/secrets.env
BUN_VERSION=1.4.2
CADDY_VERSION=2.10.2
ENCLAVER_VERSION=0.6.1
ENCLAVER_SHA256=aac505a98438e399e042d0be9dc1bc8bff4b02beee3eb149e5301af6a289730f
ENCLAVE_CPU_COUNT=1
ENCLAVE_MEMORY_MB=1536
DASHED_IP="${FIDUCY_PUBLIC_IP//./-}"
GATEWAY_HOST="gw.${DASHED_IP}.sslip.io"
CONTROL_HOST="app.${DASHED_IP}.sslip.io"
DEMO_HOST="demo.${DASHED_IP}.sslip.io"
DEMO_APP_ID_PARAMETER=/fiducy/demo/app-id
DEMO_APP_SECRET_PARAMETER=/fiducy/demo/app-secret

export PATH="/usr/local/bin:$PATH"
export HOME=/root

log() { echo "[fiducy $(date -u +%H:%M:%S)] $*"; }

install_tools() {
  if [ ! -f "$STATE_DIR/tools-installed" ]; then
    log "Installing packages"
    dnf install -y -q docker aws-nitro-enclaves-cli aws-nitro-enclaves-cli-devel \
      postgresql16-server nodejs22 jq unzip tar gzip gettext
    mkdir -p "$STATE_DIR"
    touch "$STATE_DIR/tools-installed"
  fi

  if ! swapon --show | grep -q /swapfile; then
    log "Adding 2 GB of swap for builds"
    [ -f /swapfile ] || { dd if=/dev/zero of=/swapfile bs=1M count=2048 status=none; chmod 600 /swapfile; mkswap /swapfile >/dev/null; }
    swapon /swapfile
  fi

  if [ ! -x /usr/local/bin/bun ] || [ "$(/usr/local/bin/bun --version)" != "$BUN_VERSION" ]; then
    log "Installing Bun $BUN_VERSION"
    curl -fsSL -o /tmp/bun.zip "https://github.com/oven-sh/bun/releases/download/bun-v${BUN_VERSION}/bun-linux-aarch64.zip"
    unzip -oq /tmp/bun.zip -d /tmp/bun
    install -m 755 /tmp/bun/bun-linux-aarch64/bun /usr/local/bin/bun
    ln -sf /usr/local/bin/bun /usr/local/bin/bunx
  fi

  if [ ! -x /usr/local/bin/caddy ]; then
    log "Installing Caddy $CADDY_VERSION"
    curl -fsSL -o /tmp/caddy.tgz "https://github.com/caddyserver/caddy/releases/download/v${CADDY_VERSION}/caddy_${CADDY_VERSION}_linux_arm64.tar.gz"
    tar -xzf /tmp/caddy.tgz -C /tmp caddy
    install -m 755 /tmp/caddy /usr/local/bin/caddy
  fi

  if [ ! -x /usr/local/bin/enclaver ]; then
    log "Installing Enclaver $ENCLAVER_VERSION"
    curl -fsSL -o /tmp/enclaver.tgz "https://github.com/enclaver-io/enclaver/releases/download/v${ENCLAVER_VERSION}/enclaver-linux-aarch64-v${ENCLAVER_VERSION}.tar.gz"
    echo "${ENCLAVER_SHA256}  /tmp/enclaver.tgz" | sha256sum -c -
    tar -xzf /tmp/enclaver.tgz -C /tmp
    install -m 755 "/tmp/enclaver-linux-aarch64-v${ENCLAVER_VERSION}/enclaver" /usr/local/bin/enclaver
  fi

  cat > /etc/nitro_enclaves/allocator.yaml <<EOF
---
memory_mib: ${ENCLAVE_MEMORY_MB}
cpu_count: ${ENCLAVE_CPU_COUNT}
EOF
  systemctl enable --now docker >/dev/null
  systemctl enable nitro-enclaves-allocator >/dev/null
  systemctl restart nitro-enclaves-allocator
}

ensure_secrets() {
  mkdir -p /etc/fiducy
  if [ ! -f "$SECRETS_FILE" ]; then
    log "Generating host secrets"
    umask 077
    cat > "$SECRETS_FILE" <<EOF
FIDUCY_GATEWAY_TOKEN=$(openssl rand -hex 32)
FARM_AUTH_SECRET=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -hex 24)
EOF
  fi
  # shellcheck disable=SC1090
  source "$SECRETS_FILE"
}

rotate_gateway_token() {
  local previous_token="$FIDUCY_GATEWAY_TOKEN"
  local rotated_file
  rotated_file=$(mktemp)
  umask 077
  grep -v '^FIDUCY_GATEWAY_TOKEN=' "$SECRETS_FILE" > "$rotated_file"
  echo "FIDUCY_GATEWAY_TOKEN=$(openssl rand -hex 32)" >> "$rotated_file"
  mv "$rotated_file" "$SECRETS_FILE"
  # shellcheck disable=SC1090
  source "$SECRETS_FILE"
  [ "$FIDUCY_GATEWAY_TOKEN" != "$previous_token" ] || { log "The gateway token did not change"; return 1; }
  log "Gateway token rotated; the next build seals it and the next start hands it to the control plane"
}

read_parameter() {
  aws ssm get-parameter --region "$AWS_REGION" --name "$1" --with-decryption \
    --query Parameter.Value --output text 2>/dev/null || true
}

read_demo_app() {
  DEMO_APP_ID=$(read_parameter "$DEMO_APP_ID_PARAMETER")
  DEMO_APP_SECRET=$(read_parameter "$DEMO_APP_SECRET_PARAMETER")
  if [ -n "$DEMO_APP_ID" ] && [ -n "$DEMO_APP_SECRET" ]; then
    return 0
  fi
  log "No demo app configured. Create one in the dashboard with https://${DEMO_HOST} as an allowed origin,"
  log "then store its ID in ${DEMO_APP_ID_PARAMETER} and its secret in ${DEMO_APP_SECRET_PARAMETER} (SecureString)."
  return 1
}

build_release() {
  log "Installing dependencies"
  cd "$RELEASE_DIR"
  bun install --frozen-lockfile >/dev/null

  log "Building the control plane"
  (cd apps/control-plane && bunx farm build >/dev/null)
  if read_demo_app; then
    log "Building the demo"
    (cd apps/demo && FIDUCY_APP_ID="$DEMO_APP_ID" FIDUCY_APP_SECRET="$DEMO_APP_SECRET" \
      FIDUCY_GATEWAY_URL="https://${GATEWAY_HOST}" bun run build >/dev/null)
  fi

  log "Bundling the gateway"
  bun build apps/gateway/src/server.ts --target=bun --outfile=enclave/gateway.js >/dev/null

  log "Sealing the gateway token for the enclave"
  local token_ciphertext
  local token_file
  token_file=$(mktemp)
  printf '%s' "$FIDUCY_GATEWAY_TOKEN" > "$token_file"
  token_ciphertext=$(aws kms encrypt --region "$AWS_REGION" --key-id "$FIDUCY_KMS_KEY_ID" \
    --plaintext "fileb://${token_file}" --encryption-context fiducyPurpose=gateway-token \
    --query CiphertextBlob --output text)
  rm -f "$token_file"

  log "Building the enclave image"
  docker build -q -t fiducy-gateway-app:latest \
    --build-arg FIDUCY_KMS_KEY_ID="$FIDUCY_KMS_KEY_ID" \
    --build-arg FIDUCY_KEYS_TABLE="$FIDUCY_KEYS_TABLE" \
    --build-arg FIDUCY_CONTROL_PLANE_URL="https://${CONTROL_HOST}" \
    --build-arg FIDUCY_GATEWAY_TOKEN_CIPHERTEXT="$token_ciphertext" \
    --build-arg AWS_REGION="$AWS_REGION" \
    enclave >/dev/null

  export ENCLAVE_CPU_COUNT ENCLAVE_MEMORY_MB AWS_REGION
  export CONTROL_PLANE_HOST="$CONTROL_HOST"
  envsubst < enclave/enclaver.template.yaml > enclave/enclaver.yaml
  (cd enclave && enclaver build -f enclaver.yaml > "$STATE_DIR/enclave-build.json")

  local pcr0
  pcr0=$(jq -r '.Measurements.PCR0' "$STATE_DIR/enclave-build.json")
  printf '%s' "$pcr0" > "$STATE_DIR/pcr0.txt"
  aws s3 cp --quiet "$STATE_DIR/pcr0.txt" "s3://${FIDUCY_BUCKET}/pcr0.txt"
  aws s3 cp --quiet "$STATE_DIR/enclave-build.json" "s3://${FIDUCY_BUCKET}/enclave-build.json"
  log "Enclave PCR0: $pcr0"
}

start_postgres() {
  if [ ! -f /var/lib/pgsql/data/PG_VERSION ]; then
    log "Initialising Postgres"
    postgresql-setup --initdb >/dev/null
    sed -i 's/^\(host.*127.0.0.1\/32\s*\)ident/\1scram-sha-256/; s/^\(host.*::1\/128\s*\)ident/\1scram-sha-256/' \
      /var/lib/pgsql/data/pg_hba.conf
  fi
  systemctl enable --now postgresql >/dev/null
  sudo -u postgres psql -qtAc "SELECT 1 FROM pg_roles WHERE rolname='fiducy'" | grep -q 1 ||
    sudo -u postgres psql -qc "CREATE ROLE fiducy LOGIN PASSWORD '${POSTGRES_PASSWORD}'"
  sudo -u postgres psql -qtAc "SELECT 1 FROM pg_database WHERE datname='fiducy'" | grep -q 1 ||
    sudo -u postgres psql -qc "CREATE DATABASE fiducy OWNER fiducy"
}

write_units() {
  local node_bin
  node_bin=$(command -v node-22 || command -v node)
  local database_url="postgres://fiducy:${POSTGRES_PASSWORD}@127.0.0.1:5432/fiducy"
  umask 077
  cat > /etc/fiducy/control-plane.env <<EOF
PORT=3000
HOST=127.0.0.1
NODE_ENV=production
DATABASE_URL=${database_url}
FARM_AUTH_SECRET=${FARM_AUTH_SECRET}
FARM_AUTH_URL=https://${CONTROL_HOST}
FIDUCY_GATEWAY_TOKEN=${FIDUCY_GATEWAY_TOKEN}
FIDUCY_GATEWAY_URL=https://${GATEWAY_HOST}
EOF
  cat > /etc/fiducy/demo.env <<EOF
PORT=3001
HOST=127.0.0.1
NODE_ENV=production
FIDUCY_APP_ID=${DEMO_APP_ID:-}
FIDUCY_APP_SECRET=${DEMO_APP_SECRET:-}
FIDUCY_GATEWAY_URL=https://${GATEWAY_HOST}
EOF
  umask 022

  cat > /etc/systemd/system/fiducy-control-plane.service <<EOF
[Unit]
Description=Fiducy control plane
After=network-online.target postgresql.service
[Service]
EnvironmentFile=/etc/fiducy/control-plane.env
WorkingDirectory=${RELEASE_DIR}/apps/control-plane
ExecStart=${node_bin} .farm/.output/server/index.mjs
Restart=always
[Install]
WantedBy=multi-user.target
EOF
  cat > /etc/systemd/system/fiducy-demo.service <<EOF
[Unit]
Description=Fiducy demo chat app
After=network-online.target
[Service]
EnvironmentFile=/etc/fiducy/demo.env
WorkingDirectory=${RELEASE_DIR}/apps/demo
ExecStart=${node_bin} .farm/.output/server/index.mjs
Restart=always
[Install]
WantedBy=multi-user.target
EOF
  cat > /etc/systemd/system/fiducy-enclave.service <<EOF
[Unit]
Description=Fiducy gateway inside a Nitro enclave (via Enclaver)
After=docker.service nitro-enclaves-allocator.service
Requires=docker.service
[Service]
ExecStartPre=-/usr/bin/docker rm -f fiducy-enclave
ExecStart=/usr/bin/docker run --rm --name fiducy-enclave --privileged --device /dev/nitro_enclaves -p 127.0.0.1:8787:8787 fiducy-enclave:latest
ExecStop=/usr/bin/docker stop fiducy-enclave
Restart=always
RestartSec=5
[Install]
WantedBy=multi-user.target
EOF
  cat > /etc/fiducy/Caddyfile <<EOF
${GATEWAY_HOST} {
  reverse_proxy 127.0.0.1:8787 {
    flush_interval -1
  }
}
${CONTROL_HOST} {
  reverse_proxy 127.0.0.1:3000
}
${DEMO_HOST} {
  reverse_proxy 127.0.0.1:3001 {
    flush_interval -1
  }
}
EOF
  cat > /etc/systemd/system/fiducy-caddy.service <<EOF
[Unit]
Description=Caddy TLS front for Fiducy
After=network-online.target
[Service]
Environment=HOME=/var/lib/fiducy
ExecStart=/usr/local/bin/caddy run --config /etc/fiducy/Caddyfile --adapter caddyfile
ExecReload=/usr/local/bin/caddy reload --config /etc/fiducy/Caddyfile --adapter caddyfile
Restart=always
[Install]
WantedBy=multi-user.target
EOF
  systemctl daemon-reload
}

wait_for() {
  local url="$1" name="$2"
  for _ in $(seq 1 90); do
    curl -fsS -o /dev/null "$url" && return 0
    sleep 2
  done
  log "$name did not come up at $url"
  return 1
}

start_demo() {
  if read_demo_app; then
    systemctl enable fiducy-demo >/dev/null
    systemctl restart fiducy-demo
    return 0
  fi
  systemctl disable --now fiducy-demo >/dev/null 2>&1 || true
}

start_services() {
  start_postgres
  write_units

  log "Migrating auth tables"
  (cd "$RELEASE_DIR/apps/control-plane" && set -a && source /etc/fiducy/control-plane.env && set +a &&
    bunx farm auth migrate >/dev/null)

  systemctl enable fiducy-control-plane fiducy-enclave fiducy-caddy >/dev/null
  systemctl restart fiducy-control-plane
  wait_for http://127.0.0.1:3000/api/config "Control plane"
  start_demo
  systemctl restart fiducy-caddy
  systemctl restart fiducy-enclave
  wait_for http://127.0.0.1:8787/health "Enclave gateway"
  log "Gateway:  https://${GATEWAY_HOST}"
  log "Console:  https://${CONTROL_HOST}"
  [ -n "${DEMO_APP_ID:-}" ] && log "Demo:     https://${DEMO_HOST}"
}

install_tools
ensure_secrets
case "$STEP" in
  build) build_release ;;
  start) start_services ;;
  rotate-token) rotate_gateway_token ;;
  *) echo "Unknown step $STEP" >&2; exit 2 ;;
esac
