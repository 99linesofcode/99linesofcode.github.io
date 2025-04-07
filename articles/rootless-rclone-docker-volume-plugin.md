---
title: Rclone Docker volume plugin in Rootless mode
prev:
  text: 'How I would learn Nix if I could do it again'
  link: '/articles/how-i-would-learn-nix-if-i-could-do-it-again'
---

# Rclone Docker volume plugin in rootless mode

Another quick one for you or future me. Rclone is THE command-line program for managing files in cloud storage. Docker containers that need access to files that live in the cloud have a myriad of ways to integrate rclone but the most straightforward option is definitely the [rclone docker volume plugin](https://rclone.org/docker/). In this tech quickie I'm going to show you how to set it up in a Docker rootless context.

## Shared mount propagation

Before making the switch from a dedicated Rclone container to the volume plugin myself, I had a rather cumbersome setup where the container had access to a bind mount on the host. While this worked fine it also required using a shared mount (`mount --make-shared mount_point`) as other containers need read-write access as well:

```yaml{13}
rclone:
  image: rclone/rclone:latest
  container_name: ${APP_NAME}.rclone
  cap_add:
    - SYS_ADMIN
  devices:
    - /dev/fuse
  security_opt:
    - apparmor:unconfined
  user: ${PUID}:${PGID}
  volumes:
    - $HOME/.config/rclone:/config/rclone
    - $HOME/data:/data:shared # note the shared propagation here
    - /etc/passwd:/etc/passwd:ro
    - /etc/group:/etc/group:ro
  restart: unless-stopped
  command: "mount storagedriver: /data/dir --allow-other --allow-non-empty --cache-dir=/data/cache --vfs-cache-mode writes"
```

While there are certainly use cases where you might need access to your files from the host machine warranting this approach, I haven't really had a need for it. Generally, all of my services are packaged up inside their own containers and the host does little more than running Docker itself.

## The Docker volume plugin

The Rclone documentation on the Docker volume plugin already does a great job explaining how to set it up so I'm only going to cover what should be handled differently.

Because you're using rootless mode the Docker daemon is owned by a different user and different permissions are required. By default, rclone suggests you install the plugin and store its configuration and cache in `/var/lib/docker-plugins/rclone/*` which is owned by the root user.

Instead of changing the file permissions, I would instead move things into the user's data directory (`$XDG_DATA_HOME`) which is also where Docker itself stores its data when you're running it in rootless mode.

By storing everything here you retain the portability of your user environment and everything will Just Work&trade;.

## A slightly modified installation required

First, we'll have to create the two directories required by the rclone docker plugin:

```sh
mkdir -p $XDG_DATA_HOME/docker-plugins/rclone/config $XDG_DATA_HOME/docker-plugins/rclone/cache
```

Next, place your `rclone.conf` in the new `$XDG_DATA_HOME/docker-plugins/rclone/config/` directory or symlink to it from its default location:

```sh
ln -sf $XDG_CONFIG_DIR/rclone/rclone.conf $XDG_DATA_HOME/docker-plugins/rclone/config/rclone.conf
```

And finally, we can proceed with the installation of the plugin. We only need to make two slight modifications to the install command: we define our new `config` and `cache` directories like so:

```sh
docker plugin install rclone/docker-volume-rclone:amd64 \
--alias rclone \
--grant-all-permissions \
args="-v --allow-other" \
config=$XDG_DATA_HOME/docker-plugins/rclone/config \
cache=$XDG_DATA_HOME/docker-plugins/rclone/cache
```

> [!NOTE]
> I'm installing the `amd64` version of the plugin here. Be sure to update that in case you're on a different processor architecture.

The rclone volume plugin should now be installed and enabled. As mentioned on their documentation page you can verify this by running:

```sh
docker plugin list
```

## Putting it to use

That's all there is to it. With these changes everything should work as intended and usage should be identical to what is described in the official documentation.

For the sake of completeness I'll include an example `docker-compose.yml` file below that showcases how to only mount a particular subdirectory using [volume-subpath](https://docs.docker.com/engine/storage/volumes/#mount-a-volume-subdirectory):

```yaml
services:
  myservice:
    image: myservice.io:latest
    volumes:
      - type: volume
        source: data
        target: /data
        volume:
          subpath: linuxisofiles
volumes:
  data:
    driver: rclone
    driver_opts:
      remote: 'myremotename:'
      allow_other: 'true'
      allow_non_empty: 'true'
      vfs_cache_mode: full
      poll_interval: 0
```

See you space cowboy!
