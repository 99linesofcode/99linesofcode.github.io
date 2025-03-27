{
  description = "Development environment configuration";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs =
    {
      nixpkgs,
      ...
    }@inputs:
    let
      systems = [
        "aarch64-darwin"
        "aarch64-linux"
        "x86_64-darwin"
        "x86_64-linux"
      ];

      forEachSystem = f: nixpkgs.lib.genAttrs systems f;
    in
    {
      formatter = forEachSystem (s: nixpkgs.legacyPackages.${s}.nixfmt-rfc-style);

      devShells = forEachSystem (
        system:
        let
          pkgs = import nixpkgs {
            inherit system;
            overlays = [
              # (final: prev: {
              #   nodejs = prev.nodejs_22;
              # })
            ];
          };

          # buildNodeJs = pkgs.callPackage "${nixpkgs}/pkgs/development/web/nodejs/nodejs.nix" {
          #   python = pkgs.python3;
          # };

          # nodejs = buildNodeJs {
          #   enableNpm = false;
          #   version = "22.14.0";
          #   sha256 = "sha256-xgmUa/eTtVx5VMJlgnYICNVMFhhdecsvuIBl5S3iGRQ=";
          # };
        in
        {
          default = pkgs.mkShell {
            # buildInputs = with pkgs; [
            #   nodejs
            # ];

            packages = with pkgs; [
              nodejs
              nodePackages.pnpm

              vale # prose linter
              valeStyles.alex
              valeStyles.google
              valeStyles.proselint
            ];

            shellHook = ''
              export PATH="$PWD/node_modules/.bin/:$PATH"
            '';
          };
        }
      );
    };
}
