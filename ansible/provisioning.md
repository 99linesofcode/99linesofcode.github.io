---
layout: doc
title: Ansible
titleTemplate: Provisioning your server
---

# Ansible

## Provisioning your server

For most applications running whole Kubernetes clusters is overkill since they tend not to need the horizontal scaling that it offers. Most medium to large scale applications can still run well on a single VPS. Certainly anything I have running in my home lab.

The following provision script configures a fresh Ubuntu box so that it is ready to serve Docker containers safely. It also configures the shell environment and makes sure the latest version of neovim gets installed through Asdf, a tool version manager.

Variables are pulled in from a separate variable file encrypted with `ansible-vault encrypt <filepath>` which looks like this:

```yaml
user:
  name: <USERNAME>
  password: <PASSWORD>
  salt: <PASSWORD_SALT>
ssh_key: <PUBLIC_SSH_KEY_FILENAME>
```

::: warning Note
This playbook sets up the user environment and then revokes root SSH access. After running it you will no longer be able to SSH into your machine as root. Use the newly created user for all subsequent logins for example: `ssh 99linesofcode@srv01`
:::

<<< @/snippets/ansible/provision.yaml
