terraform {
  required_version = ">= 1.5"

  required_providers {
    render = {
      source  = "render-oss/render"
      version = "~> 1.9"
    }
    neon = {
      source  = "kislerdm/neon"
      version = "~> 0.18"
    }
  }
}

# Sin credenciales acá: los dos providers las leen directo de variables de
# entorno (RENDER_API_KEY, RENDER_OWNER_ID, NEON_API_KEY) si los bloques
# quedan vacíos. Exportalas en la terminal antes de un init/plan/apply/destroy
# — nunca van a terraform.tfvars ni se commitean (ver .gitignore).
provider "render" {}

provider "neon" {}
