#!/bin/bash
shopt -s extglob
gt=$GITHUB_TOKEN
echo $gt
cmd="git clone https://$gt@github.com/luckycreationsindia/digital_business_card.git ./tmp"
$cmd
cp -fr ./tmp/* ./
rm -fr ./.git ./.idea ./tmp