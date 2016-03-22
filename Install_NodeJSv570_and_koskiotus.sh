#!/bin/bash

# Fetch packages from alextgalileo repo
echo "src/gz all http://repo.opkg.net/edison/repo/all
src/gz edison http://repo.opkg.net/edison/repo/edison
src/gz core2-32 http://repo.opkg.net/edison/repo/core2-32" >> /etc/opkg/base-feeds.conf

# Install necessary utilities
opkg update
opkg install git
opkg install util-linux
opkg install tar

# Install nvm
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh | bash

# You have to run this command every time you connect to Edison
source ~/.nvm/nvm.sh

# Install and use newest NodeJS
nvm install 5.7.0
nvm use 5.7.0
nvm alias default 5.7.0

# Get koskIoTus repository
cd ~/
git clone https://github.com/majori/koskiotus
cd koskiotus
