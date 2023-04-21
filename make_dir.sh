#!/bin/sh

if [ ! -d "$HOME/data" ]; then
        mkdir -p $HOME/data
        mkdir -p $HOME/data/postgres
fi