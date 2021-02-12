#!/bin/bash
npm install
DEBUG=express:* supervisor --node-options --inspect start