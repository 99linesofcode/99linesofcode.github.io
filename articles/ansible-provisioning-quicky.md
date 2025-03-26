---
title: Ansible
titleTemplate: Provisioning your server
next:
  text: 'How I would learn Nix if I could do it again'
  link: '/articles/how-i-would-learn-nix-if-i-could-do-it-again'
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

```yaml
---
- name: Provision
  hosts: personal
  vars_files:
    - ./variables.yaml
  tasks:
    - name: Add Docker public signing key
      ansible.builtin.apt_key:
        url: https://download.docker.com/linux/ubuntu/gpg
        state: present

    - name: Add Docker repository to sources list
      ansible.builtin.apt_repository:
        repo: deb [signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu jammy stable
        state: present

    - name: Update package registry
      ansible.builtin.apt:
        upgrade: dist

    - name: Install base dependencies
      ansible.builtin.apt:
        pkg:
          - ca-certificates
          - clang
          - curl
          - gnupg
          - containerd.io
          - dbus-user-session
          - docker-ce
          - docker-ce-cli
          - docker-buildx-plugin
          - docker-compose-plugin
          - fd-find
          - fzf
          - git
          - neofetch
          - ripgrep
          - tmux
          - uidmap
          - zsh

    # NOTE running Docker in rootless mode has its limitations: https://docs.docker.com/engine/security/rootless/#known-limitations
    - name: Disable and mask Docker systemd services
      ansible.builtin.systemd_service:
        name: "{{ item }}"
        enabled: false
        masked: true
      loop:
        - docker.service
        - docker.socket

    - name: Ensure user group 1000 exists
      ansible.builtin.group:
        name: "{{ user.name }}"
        state: present
        gid: 1000

    - name: Create user "{{ user.name }}", set group id and add to relevant groups
      ansible.builtin.user:
        name: "{{ user.name }}"
        password: "{{ user.password | password_hash('sha512', user.salt) }}"
        append: true
        uid: 1000
        group: 1000
        groups:
          - sudo
          - docker
        shell: /bin/zsh

    - name: Configure user environment
      block:
        - name: Setup rootless Docker daemon
          ansible.builtin.shell: dockerd-rootless-setuptool.sh install

        - name: Enable Docker systemd user service
          ansible.builtin.systemd_service:
            name: docker.service
            enabled: true
            scope: user

        - name: Create user directories
          ansible.builtin.file:
            path: "$HOME/{{ item }}"
            state: directory
            mode: 0700
          loop:
            - .ssh/
            - .config/
            - .local/
            - .local/bin/
            - .local/share/
            - .local/state/

        - name: Allow SSH access for user "{{ user.name }}"
          ansible.posix.authorized_key:
            user: "{{ user.name }}"
            state: present
            key: "{{ lookup('file', lookup('env', 'HOME') + '/.ssh/' + ssh_key) }}"

        - name: Download zoxide installer script
          ansible.builtin.get_url:
            url: "https://raw.githubusercontent.com/ajeetdsouza/zoxide/main/install.sh"
            dest: "$HOME/zoxide-install.sh"
            mode: 0700

        - name: Install zoxide binary
          ansible.builtin.command: ./zoxide-install.sh --unattended
          args:
            chdir: "$HOME"
            creates: "/usr/bin/zoxide"

        - name: Pull dotfiles repository
          ansible.builtin.git:
            repo: https://github.com/99linesofcode/dotfiles.git
            dest: "$HOME/dotfiles"
            single_branch: yes
            version: main
            force: true

        - name: Clean up installation artifacts and other unused files
          ansible.builtin.file:
            path: "$HOME/{{ item }}"
            state: absent
          loop:
            - .bash_logout
            - .bashrc
            - .profile
            - .zshrc
            - zoxide-install.sh
            - oh-my-zsh-install.sh

        - name: Run dotfiles/install.sh script to configure user environment
          ansible.builtin.shell:
            chdir: "$HOME/dotfiles"
            cmd: ./install.sh

        - name: Remove keychain plugin and identity loading configuration from .zshrc
          ansible.builtin.lineinfile:
            path: "$HOME/.zshrc"
            regexp: "{{ item }}"
            state: absent
          loop:
            - "gpg-agent$"
            - "^zstyle :omz:plugins:keychain agents gpg,ssh"
            - "^zstyle :omz:plugins:keychain identities .*"
      become: true
      become_user: "{{ user.name }}"

    - name: Launch Docker daemon on system startup
      ansible.builtin.shell: "loginctl enable-linger {{ user.name }}"

    - name: Allow Docker to expose priviledged ports (< 1024)
      ansible.builtin.shell: "setcap cap_net_bind_service=ep $(which rootlesskit)"

    - name: Remove public SSH key from root account
      ansible.posix.authorized_key:
        user: root
        state: absent
        key: "{{ lookup('file', lookup('env', 'HOME') + '/.ssh/' + ssh_key) }}"
```
