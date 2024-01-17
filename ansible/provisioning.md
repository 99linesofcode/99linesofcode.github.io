---
layout: doc
title: Ansible
titleTemplate: Provisioning your server
---

# Ansible

## Provisioning your server

For most applications running whole Kubernetes clusters is overkill since they tend not to need the horizontal scaling that it offers. Most medium to large scale applications can still run well on a single VPS. Certainly anything I have running in my home lab.

The following provision script configures a fresh Ubuntu box so that it is ready to serve Docker containers safely. It might need some additional hardening but I'm not sure how I want to approach that just yet.

<<< @/snippets/ansible/provision.yaml
