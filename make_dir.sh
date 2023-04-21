#!/bin/sh

if [ ! -d "$HOME/data" ]; then
        mkdir $HOME/data
        mkdir $HOME/data/postgres
fi