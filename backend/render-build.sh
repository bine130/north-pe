#!/bin/bash
# Render build script for backend

echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Build completed successfully!"