#!/bin/bash
set -e
npm install
npm run push --workspace=packages/shared/db
