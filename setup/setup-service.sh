#!/bin/bash
cp havenchat.service /etc/systemd/system/
systemctl enable havenchat.service
systemctl daemon-reload
systemctl start havenchat
