#!/bin/bash

echo "Cleaning up previous installation..."
rm -rf node_modules package-lock.json .svelte-kit build

echo "Installing dependencies..."
npm install --legacy-peer-deps

echo "Running SvelteKit sync..."
npm run sync

echo "Building the application..."
npm run build

echo "Starting the application..."
npm run dev