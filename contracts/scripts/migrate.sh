#!/bin/bash

echo "Building Dojo contracts..."
sozo build

echo "Migrating contracts..."
sozo migrate

echo "Migration complete!"
